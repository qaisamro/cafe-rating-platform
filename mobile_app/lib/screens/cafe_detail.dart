import 'dart:convert';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/screens/login_screen.dart';

class CafeDetail extends StatefulWidget {
  final int cafeId;
  CafeDetail({required this.cafeId});
  @override
  _CafeDetailState createState() => _CafeDetailState();
}

class _CafeDetailState extends State<CafeDetail> with SingleTickerProviderStateMixin {
  Map? _cafe;
  List _products = [];
  List _reviews = [];
  bool _isLoading = true;
  String _selectedCategory = 'الكل';
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() { _tabController.dispose(); super.dispose(); }

  void _loadData() async {
    try {
      final results = await Future.wait([
        ApiService.get('/cafes/${widget.cafeId}'),
        ApiService.get('/products/cafe/${widget.cafeId}'),
        ApiService.get('/reviews/cafe/${widget.cafeId}'),
      ]);
      if (mounted) setState(() {
        if (results[0].statusCode == 200) _cafe = jsonDecode(results[0].body);
        if (results[1].statusCode == 200) _products = jsonDecode(results[1].body);
        if (results[2].statusCode == 200) _reviews = jsonDecode(results[2].body);
        _isLoading = false;
      });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  String _imgUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('/')) return 'http://localhost:5000$url';
    return url;
  }

  void _handleReview() async {
    final token = await ApiService.getToken();
    if (token == null || token.isEmpty) { _showLoginDialog(); return; }
    _showAddReviewDialog();
  }

  void _showLoginDialog() => showDialog(
    context: context,
    builder: (_) => BackdropFilter(
      filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
      child: AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
        title: Row(children: [
          Container(padding: EdgeInsets.all(8), decoration: BoxDecoration(color: AppColors.primaryLight, shape: BoxShape.circle), child: Icon(Icons.lock_outline, color: AppColors.primary, size: 20)),
          SizedBox(width: 12),
          Text('تسجيل الدخول مطلوب', style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 18)),
        ]),
        content: Text('يجب تسجيل دخولك لتضيف تقييماً وتكسب نقاطاً.', style: GoogleFonts.cairo(color: AppColors.textMuted)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text('إلغاء', style: GoogleFonts.cairo())),
          ElevatedButton(
            onPressed: () { Navigator.pop(context); Navigator.push(context, MaterialPageRoute(builder: (_) => LoginScreen())); },
            child: Text('تسجيل الدخول', style: GoogleFonts.cairo()),
          ),
        ],
      ),
    ),
  );

  void _showAddReviewDialog() {
    double _rating = 5;
    final _comment = TextEditingController();
    showDialog(
      context: context,
      builder: (_) => StatefulBuilder(
        builder: (ctx, setS) => BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
          child: AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
            title: Text('قيّم تجربتك ⭐', style: GoogleFonts.cairo(fontWeight: FontWeight.w900, fontSize: 22)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text('كم تقيّم ${_cafe?['name'] ?? 'هذا المقهى'}؟', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 14)),
                SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (i) => GestureDetector(
                    onTap: () => setS(() => _rating = i + 1.0),
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 4),
                      child: Icon(i < _rating ? Icons.star_rounded : Icons.star_outline_rounded, color: AppColors.warning, size: 40),
                    ),
                  )),
                ),
                SizedBox(height: 20),
                TextField(
                  controller: _comment,
                  textAlign: TextAlign.right,
                  maxLines: 4,
                  style: GoogleFonts.cairo(),
                  decoration: InputDecoration(
                    hintText: 'اكتب تجربتك بكل صدق...',
                    hintStyle: GoogleFonts.cairo(color: AppColors.textMuted),
                    filled: true,
                    fillColor: AppColors.bg,
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(16), borderSide: BorderSide.none),
                  ),
                ),
                SizedBox(height: 12),
                Container(
                  padding: EdgeInsets.all(10),
                  decoration: BoxDecoration(color: AppColors.warning.withOpacity(0.08), borderRadius: BorderRadius.circular(12)),
                  child: Row(children: [
                    Icon(Icons.info_outline, color: AppColors.warning, size: 16),
                    SizedBox(width: 8),
                    Expanded(child: Text('يظهر تقييمك بعد موافقة الإدارة', style: GoogleFonts.cairo(fontSize: 12, color: AppColors.warning, fontWeight: FontWeight.w600))),
                  ]),
                ),
              ],
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context), child: Text('تراجع', style: GoogleFonts.cairo())),
              ElevatedButton(
                onPressed: () async {
                  final res = await ApiService.post('/reviews', { 'cafe_id': widget.cafeId, 'rating': _rating, 'comment': _comment.text });
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text(res.statusCode == 201 ? '✅ تم إرسال تقييمك بنجاح!' : '❌ حدث خطأ، حاول مجدداً', style: GoogleFonts.cairo(fontWeight: FontWeight.w700)),
                    backgroundColor: res.statusCode == 201 ? AppColors.success : AppColors.danger,
                    behavior: SnackBarBehavior.floating,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ));
                  if (res.statusCode == 201) _loadData();
                },
                child: Text('إرسال التقييم', style: GoogleFonts.cairo()),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return Scaffold(body: Center(child: CircularProgressIndicator(color: AppColors.primary)));
    if (_cafe == null) return Scaffold(body: Center(child: Text('لم يتم العثور على هذا المقهى', style: GoogleFonts.cairo())));

    final cafeImg = _imgUrl(_cafe!['image_url']);
    final defaultImg = 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80';

    return Scaffold(
      backgroundColor: AppColors.bg,
      floatingActionButton: Container(
        height: 60,
        margin: EdgeInsets.symmetric(horizontal: 24),
        child: ElevatedButton.icon(
          onPressed: _handleReview,
          icon: Icon(Icons.star_rounded, color: Colors.white),
          label: Text('قيّم واكسب 10 نقاط', style: GoogleFonts.cairo(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.white)),
          style: ElevatedButton.styleFrom(
            minimumSize: Size(double.infinity, 60),
            backgroundColor: AppColors.primary,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            elevation: 12,
            shadowColor: AppColors.primary.withOpacity(0.4),
          ),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerFloat,
      body: CustomScrollView(
        physics: BouncingScrollPhysics(),
        slivers: [
          // Hero App Bar
          SliverAppBar(
            expandedHeight: 300,
            pinned: true,
            stretch: true,
            backgroundColor: AppColors.primary,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(_cafe!['name'], style: GoogleFonts.cairo(fontWeight: FontWeight.w900, shadows: [Shadow(color: Colors.black54, blurRadius: 12)])),
              background: Stack(
                fit: StackFit.expand,
                children: [
                  Image.network(cafeImg.isNotEmpty ? cafeImg : defaultImg, fit: BoxFit.cover, errorBuilder: (_,__,___) => Image.network(defaultImg, fit: BoxFit.cover)),
                  Container(decoration: BoxDecoration(gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Colors.transparent, Colors.black.withOpacity(0.75)]))),
                ],
              ),
            ),
          ),

          // Info Card
          SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 20, offset: Offset(0, 8))],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (_cafe!['address'] != null) Row(children: [
                          Icon(Icons.location_on_rounded, color: AppColors.accent, size: 18),
                          SizedBox(width: 8),
                          Expanded(child: Text(_cafe!['address'], style: GoogleFonts.cairo(color: AppColors.textSecondary, fontWeight: FontWeight.w600))),
                        ]),
                        if (_cafe!['description'] != null) ...[
                          SizedBox(height: 16),
                          Text(_cafe!['description'], style: GoogleFonts.cairo(color: AppColors.textSecondary, height: 1.6)),
                        ],
                      ],
                    ),
                  ),
                  SizedBox(height: 24),

                  // Tab Bar
                  Container(
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                    child: TabBar(
                      controller: _tabController,
                      indicator: BoxDecoration(gradient: AppColors.cardGradient, borderRadius: BorderRadius.circular(12)),
                      indicatorSize: TabBarIndicatorSize.tab,
                      labelColor: Colors.white,
                      unselectedLabelColor: AppColors.textMuted,
                      labelStyle: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 15),
                      tabs: [
                        Tab(text: 'القائمة (${_products.length})'),
                        Tab(text: 'التقييمات (${_reviews.length})'),
                      ],
                    ),
                  ),
                  SizedBox(height: 20),
                  SizedBox(
                    height: 400,
                    child: TabBarView(
                      controller: _tabController,
                      children: [
                        // Products tab
                        _products.isEmpty
                            ? Center(child: Column(children: [Icon(Icons.hourglass_empty, color: Colors.grey[300], size: 48), SizedBox(height: 12), Text('القائمة فارغة', style: GoogleFonts.cairo(color: AppColors.textMuted))]))
                            : Builder(
                                builder: (ctx) {
                                  final categories = ['الكل', ..._products.map((p) => p['category']?.toString() ?? 'عام').toSet()];
                                  final filteredProducts = _selectedCategory == 'الكل' 
                                      ? _products 
                                      : _products.where((p) => (p['category']?.toString() ?? 'عام') == _selectedCategory).toList();

                                  return Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      SingleChildScrollView(
                                        scrollDirection: Axis.horizontal,
                                        physics: BouncingScrollPhysics(),
                                        padding: EdgeInsets.only(bottom: 16),
                                        child: Row(
                                          children: categories.map((cat) {
                                            final isSelected = _selectedCategory == cat;
                                            return Padding(
                                              padding: EdgeInsets.only(left: 8),
                                              child: ChoiceChip(
                                                label: Text(cat, style: GoogleFonts.cairo(fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600)),
                                                selected: isSelected,
                                                selectedColor: AppColors.primary,
                                                labelStyle: TextStyle(color: isSelected ? Colors.white : AppColors.textPrimary),
                                                backgroundColor: Colors.white,
                                                onSelected: (val) {
                                                  if (val) setState(() => _selectedCategory = cat);
                                                },
                                              ),
                                            );
                                          }).toList(),
                                        ),
                                      ),
                                      Expanded(
                                        child: filteredProducts.isEmpty 
                                          ? Center(child: Text('لا توجد منتجات في هذا التصنيف', style: GoogleFonts.cairo(color: AppColors.textMuted)))
                                          : ListView.builder(
                                            physics: BouncingScrollPhysics(),
                                            itemCount: filteredProducts.length,
                                            itemBuilder: (_, i) {
                                              final p = filteredProducts[i];
                                              final img = _imgUrl(p['image_url']);
                                              return Container(
                                                margin: EdgeInsets.only(bottom: 14),
                                                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.border)),
                                                child: ListTile(
                                                  contentPadding: EdgeInsets.all(14),
                                                  leading: ClipRRect(borderRadius: BorderRadius.circular(14), child: SizedBox(width: 60, height: 60, child: img.isNotEmpty ? Image.network(img, fit: BoxFit.cover, errorBuilder: (_,__,___) => _placeholder()) : _placeholder())),
                                                  title: Text(p['name'], style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 16)),
                                                  subtitle: Text(p['description'] ?? '', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 13), maxLines: 2, overflow: TextOverflow.ellipsis),
                                                ),
                                              );
                                            },
                                          ),
                                      ),
                                    ],
                                  );
                                },
                              ),
                        // Reviews tab
                        _reviews.isEmpty
                            ? Center(child: Column(children: [Icon(Icons.star_border, color: Colors.grey[300], size: 48), SizedBox(height: 12), Text('لا يوجد تقييمات بعد', style: GoogleFonts.cairo(color: AppColors.textMuted))]))
                            : ListView.builder(
                                physics: NeverScrollableScrollPhysics(),
                                itemCount: _reviews.length,
                                itemBuilder: (_, i) {
                                  final r = _reviews[i];
                                  return Container(
                                    margin: EdgeInsets.only(bottom: 14),
                                    padding: EdgeInsets.all(18),
                                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.border)),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Row(children: [
                                              CircleAvatar(backgroundColor: AppColors.primaryLight, child: Text(r['user_name']?[0] ?? 'م', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800))),
                                              SizedBox(width: 12),
                                              Text(r['user_name'] ?? 'مستخدم', style: GoogleFonts.cairo(fontWeight: FontWeight.w700, fontSize: 15)),
                                            ]),
                                            Row(children: [
                                              Text('${r['rating']}', style: GoogleFonts.cairo(fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
                                              Icon(Icons.star_rounded, color: AppColors.warning, size: 18),
                                            ]),
                                          ],
                                        ),
                                        SizedBox(height: 12),
                                        Container(
                                          padding: EdgeInsets.all(12),
                                          decoration: BoxDecoration(color: AppColors.bg, borderRadius: BorderRadius.circular(12), border: Border(right: BorderSide(color: AppColors.primary, width: 3))),
                                          child: Text(r['comment'] ?? '', style: GoogleFonts.cairo(color: AppColors.textSecondary, height: 1.5)),
                                        ),
                                      ],
                                    ),
                                  );
                                },
                              ),
                      ],
                    ),
                  ),
                  SizedBox(height: 100),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _placeholder() => Container(color: AppColors.primaryLight, child: Center(child: Icon(Icons.coffee, color: AppColors.primary, size: 28)));
}
