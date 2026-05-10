import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/screens/cafe_detail.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/screens/search_screen.dart';
import 'package:mobile_app/screens/all_cafes_screen.dart';
import 'package:mobile_app/screens/notifications_screen.dart';

class UserHome extends StatefulWidget {
  @override
  _UserHomeState createState() => _UserHomeState();
}

class _UserHomeState extends State<UserHome> {
  List _cafes = [];
  List _products = [];
  bool _isLoading = true;

  @override
  void initState() { super.initState(); _loadData(); }

  void _loadData() async {
    try {
      final c = await ApiService.get('/cafes/top-rated');
      final p = await ApiService.get('/products');
      if (mounted) setState(() {
        _cafes = c.statusCode == 200 ? jsonDecode(c.body) : [];
        _products = p.statusCode == 200 ? jsonDecode(p.body) : [];
        _isLoading = false;
      });
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: () async => _loadData(),
              color: AppColors.primary,
              child: CustomScrollView(
                physics: BouncingScrollPhysics(),
                slivers: [
                  // Hero Header
                  SliverToBoxAdapter(
                    child: Container(
                      padding: EdgeInsets.fromLTRB(24, 60, 24, 32),
                      decoration: BoxDecoration(
                        gradient: AppColors.heroGradient,
                        borderRadius: BorderRadius.vertical(bottom: Radius.circular(40)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text('أهلاً بك ✨', style: GoogleFonts.cairo(color: Colors.white.withOpacity(0.75), fontSize: 15)),
                                  Text('اكتشف أفضل المقاهي', style: GoogleFonts.cairo(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900)),
                                ],
                              ),
                              GestureDetector(
                                onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => NotificationsScreen())),
                                child: Container(
                                  width: 44, height: 44,
                                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), shape: BoxShape.circle),
                                  child: Icon(Icons.notifications_outlined, color: Colors.white, size: 22),
                                ),
                              ),
                            ],
                          ),
                          SizedBox(height: 20),
                          GestureDetector(
                            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => SearchScreen())),
                            child: Container(
                              decoration: BoxDecoration(color: Colors.white.withOpacity(0.18), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withOpacity(0.25))),
                              child: Row(
                                children: [
                                  Padding(padding: EdgeInsets.symmetric(horizontal: 14), child: Icon(Icons.search, color: Colors.white.withOpacity(0.7))),
                                  Expanded(child: TextField(
                                    enabled: false,
                                    textAlign: TextAlign.right,
                                    style: GoogleFonts.cairo(color: Colors.white),
                                    decoration: InputDecoration(
                                      hintText: 'ابحث عن مقهى أو منتج...',
                                      hintStyle: GoogleFonts.cairo(color: Colors.white.withOpacity(0.6)),
                                      border: InputBorder.none, enabledBorder: InputBorder.none, focusedBorder: InputBorder.none,
                                      filled: false, contentPadding: EdgeInsets.symmetric(vertical: 14),
                                    ),
                                  )),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  SliverToBoxAdapter(child: SizedBox(height: 32)),

                  // Top Rated Cafes Section
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 24),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('المقاهي الأكثر تقييماً ⭐', style: GoogleFonts.cairo(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                          GestureDetector(
                            onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => AllCafesScreen())),
                            child: Text('عرض الكل', style: GoogleFonts.cairo(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 14)),
                          ),
                        ],
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(child: SizedBox(height: 16)),
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: 240,
                      child: _cafes.isEmpty
                          ? Center(child: Text('لا توجد مقاهي حالياً', style: GoogleFonts.cairo(color: AppColors.textMuted)))
                          : ListView.builder(
                              scrollDirection: Axis.horizontal,
                              physics: BouncingScrollPhysics(),
                              padding: EdgeInsets.symmetric(horizontal: 16),
                              itemCount: _cafes.length,
                              itemBuilder: (context, i) {
                                final cafe = _cafes[i];
                                final img = ApiService.imgUrl(cafe['image_url']);
                                final rating = double.tryParse('${cafe['avg_rating'] ?? cafe['average_rating'] ?? 0}') ?? 0.0;
                                final reviewCount = int.tryParse('${cafe['total_reviews'] ?? cafe['review_count'] ?? 0}') ?? 0;
                                return GestureDetector(
                                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CafeDetail(cafeId: cafe['id']))),
                                  child: Container(
                                    width: 185,
                                    margin: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.white,
                                      borderRadius: BorderRadius.circular(24),
                                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.07), blurRadius: 20, offset: Offset(0, 8))],
                                    ),
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.stretch,
                                      children: [
                                        ClipRRect(
                                          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                                          child: SizedBox(
                                            height: 130,
                                            child: img.isNotEmpty
                                                ? Image.network(img, fit: BoxFit.cover, errorBuilder: (_,__,___) => _cafeImgPlaceholder())
                                                : _cafeImgPlaceholder(),
                                          ),
                                        ),
                                        Padding(
                                          padding: EdgeInsets.all(14),
                                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                            Text(cafe['name'], style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.textPrimary), maxLines: 1, overflow: TextOverflow.ellipsis),
                                            SizedBox(height: 6),
                                            Row(children: [
                                              Icon(Icons.star_rounded, color: AppColors.warning, size: 16),
                                              SizedBox(width: 4),
                                              Text(rating > 0 ? rating.toStringAsFixed(1) : 'جديد', style: GoogleFonts.cairo(fontWeight: FontWeight.w700, fontSize: 13, color: AppColors.textMuted)),
                                              SizedBox(width: 4),
                                              if (reviewCount > 0) Text('(${reviewCount})', style: GoogleFonts.cairo(fontSize: 11, color: AppColors.textMuted)),
                                            ])
                                          ]),
                                        ),
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
                    ),
                  ),

                  SliverToBoxAdapter(child: SizedBox(height: 36)),

                  // Products Section
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.symmetric(horizontal: 24),
                      child: Text('اكتشف المنيو 🍽️', style: GoogleFonts.cairo(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                    ),
                  ),
                  SliverToBoxAdapter(child: SizedBox(height: 16)),
                  SliverPadding(
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (ctx, i) {
                          final p = _products[i];
                          final img = ApiService.imgUrl(p['image_url']);
                          return Container(
                            margin: EdgeInsets.only(bottom: 14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: Offset(0, 4))],
                            ),
                            child: ListTile(
                              contentPadding: EdgeInsets.all(14),
                              leading: ClipRRect(
                                borderRadius: BorderRadius.circular(16),
                                child: SizedBox(
                                  width: 60, height: 60,
                                  child: img.isNotEmpty
                                      ? Image.network(img, fit: BoxFit.cover, errorBuilder: (_,__,___) => _productPlaceholder())
                                      : _productPlaceholder(),
                                ),
                              ),
                              title: Text(p['name'], style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.textPrimary)),
                              subtitle: Padding(padding: EdgeInsets.only(top: 4), child: Row(children: [
                                Icon(Icons.stars_rounded, color: AppColors.warning, size: 13),
                                SizedBox(width: 4),
                                Text('${p['points_reward'] ?? 10} نقطة عند التقييم', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 12)),
                              ])),
                              trailing: Container(
                                padding: EdgeInsets.all(8),
                                decoration: BoxDecoration(color: AppColors.primaryLight, shape: BoxShape.circle),
                                child: Icon(Icons.arrow_back_ios_new, size: 14, color: AppColors.primary),
                              ),
                              onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CafeDetail(cafeId: p['cafe_id']))),
                            ),
                          );
                        },
                        childCount: _products.length,
                      ),
                    ),
                  ),
                  SliverToBoxAdapter(child: SizedBox(height: 100)),
                ],
              ),
            ),
    );
  }

  Widget _cafeImgPlaceholder() => Container(
    color: AppColors.primaryLight,
    child: Center(child: Icon(Icons.coffee_rounded, color: AppColors.primary, size: 40)),
  );

  Widget _productPlaceholder() => Container(
    color: AppColors.primaryLight,
    child: Center(child: Icon(Icons.local_cafe, color: AppColors.primary, size: 28)),
  );
}
