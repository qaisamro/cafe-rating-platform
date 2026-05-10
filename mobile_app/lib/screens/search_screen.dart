import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/screens/cafe_detail.dart';

class SearchScreen extends StatefulWidget {
  @override
  _SearchScreenState createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  List _cafes = [];
  List _products = [];
  
  List _filteredCafes = [];
  List _filteredProducts = [];
  
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadData() async {
    try {
      final c = await ApiService.get('/cafes');
      final p = await ApiService.get('/products');
      if (mounted) setState(() {
        if (c.statusCode == 200) _cafes = jsonDecode(c.body);
        if (p.statusCode == 200) _products = jsonDecode(p.body);
        _isLoading = false;
      });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  void _onSearchChanged() {
    final query = _searchController.text.trim().toLowerCase();
    setState(() {
      if (query.isEmpty) {
        _filteredCafes = [];
        _filteredProducts = [];
      } else {
        _filteredCafes = _cafes.where((c) {
          final name = c['name']?.toString().toLowerCase() ?? '';
          final desc = c['description']?.toString().toLowerCase() ?? '';
          return name.contains(query) || desc.contains(query);
        }).toList();

        _filteredProducts = _products.where((p) {
          final name = p['name']?.toString().toLowerCase() ?? '';
          final desc = p['description']?.toString().toLowerCase() ?? '';
          final cat = p['category']?.toString().toLowerCase() ?? '';
          return name.contains(query) || desc.contains(query) || cat.contains(query);
        }).toList();
      }
    });
  }

  String _imgUrl(String? url) => ApiService.imgUrl(url);

  Widget _buildCafeItem(dynamic cafe) {
    final img = _imgUrl(cafe['image_url']);
    return ListTile(
      contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      leading: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(width: 50, height: 50, child: img.isNotEmpty ? Image.network(img, fit: BoxFit.cover, errorBuilder: (_,__,___) => _cafeImgPlaceholder()) : _cafeImgPlaceholder()),
      ),
      title: Text(cafe['name'], style: GoogleFonts.cairo(fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
      subtitle: Text(cafe['address'] ?? '', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 13), maxLines: 1),
      onTap: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => CafeDetail(cafeId: cafe['id']))),
      trailing: Container(padding: EdgeInsets.all(6), decoration: BoxDecoration(color: AppColors.primaryLight, shape: BoxShape.circle), child: Icon(Icons.arrow_back_ios_new, size: 14, color: AppColors.primary)),
    );
  }

  Widget _buildProductItem(dynamic p) {
    final img = _imgUrl(p['image_url']);
    return ListTile(
      contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      leading: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(width: 50, height: 50, child: img.isNotEmpty ? Image.network(img, fit: BoxFit.cover, errorBuilder: (_,__,___) => _productImgPlaceholder()) : _productImgPlaceholder()),
      ),
      title: Text(p['name'], style: GoogleFonts.cairo(fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
      subtitle: Text(p['category'] ?? 'عام', style: GoogleFonts.cairo(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.bold)),
      onTap: () => Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => CafeDetail(cafeId: p['cafe_id']))),
      trailing: Container(padding: EdgeInsets.all(6), decoration: BoxDecoration(color: AppColors.primaryLight, shape: BoxShape.circle), child: Icon(Icons.arrow_back_ios_new, size: 14, color: AppColors.primary)),
    );
  }

  Widget _cafeImgPlaceholder() => Container(color: AppColors.primaryLight, child: Center(child: Icon(Icons.coffee_rounded, color: AppColors.primary, size: 24)));
  Widget _productImgPlaceholder() => Container(color: AppColors.primaryLight, child: Center(child: Icon(Icons.local_cafe, color: AppColors.primary, size: 24)));

  @override
  Widget build(BuildContext context) {
    final hasQuery = _searchController.text.trim().isNotEmpty;
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        titleSpacing: 0,
        title: TextField(
          controller: _searchController,
          autofocus: true,
          style: GoogleFonts.cairo(fontWeight: FontWeight.w600),
          decoration: InputDecoration(
            hintText: 'ابحث عن مقهى، قهوة، حلويات...',
            border: InputBorder.none, enabledBorder: InputBorder.none, focusedBorder: InputBorder.none,
            filled: false,
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(Icons.close),
            onPressed: () {
              if (_searchController.text.isNotEmpty) _searchController.clear();
            },
          ),
        ],
      ),
      body: _isLoading 
        ? Center(child: CircularProgressIndicator(color: AppColors.primary))
        : !hasQuery 
          ? Center(child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.search_rounded, size: 80, color: Colors.grey[300]),
                SizedBox(height: 16),
                Text('اكتب شيئاً للبحث المباشر', style: GoogleFonts.cairo(fontSize: 18, color: AppColors.textMuted)),
              ],
            ))
          : _filteredCafes.isEmpty && _filteredProducts.isEmpty
            ? Center(child: Text('لا يوجد تفضيلات مطابقة.', style: GoogleFonts.cairo(fontSize: 16, color: AppColors.textMuted)))
            : CustomScrollView(
                physics: BouncingScrollPhysics(),
                slivers: [
                  if (_filteredCafes.isNotEmpty) ...[
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.fromLTRB(20, 20, 20, 8),
                        child: Text('المقاهي المطابقة', style: GoogleFonts.cairo(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 16)),
                      ),
                    ),
                    SliverList(
                      delegate: SliverChildBuilderDelegate((_, i) => _buildCafeItem(_filteredCafes[i]), childCount: _filteredCafes.length),
                    ),
                  ],
                  if (_filteredProducts.isNotEmpty) ...[
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.fromLTRB(20, 20, 20, 8),
                        child: Text('المنتجات المطابقة', style: GoogleFonts.cairo(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 16)),
                      ),
                    ),
                    SliverList(
                      delegate: SliverChildBuilderDelegate((_, i) => _buildProductItem(_filteredProducts[i]), childCount: _filteredProducts.length),
                    ),
                  ],
                ],
              ),
    );
  }
}
