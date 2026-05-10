import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/screens/cafe_detail.dart';

class AllCafesScreen extends StatefulWidget {
  @override
  _AllCafesScreenState createState() => _AllCafesScreenState();
}

class _AllCafesScreenState extends State<AllCafesScreen> {
  List _cafes = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCafes();
  }

  void _loadCafes() async {
    try {
      final res = await ApiService.get('/cafes');
      if (mounted) setState(() {
        _cafes = res.statusCode == 200 ? jsonDecode(res.body) : [];
        _isLoading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  String _imgUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('/')) return 'http://localhost:5000$url';
    return url;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      appBar: AppBar(
        title: Text('المقاهي المميزة', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _cafes.isEmpty
              ? Center(child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.coffee_rounded, size: 80, color: Colors.grey[300]),
                    SizedBox(height: 16),
                    Text('لا توجد مقاهي حالياً', style: GoogleFonts.cairo(fontSize: 18, color: AppColors.textMuted)),
                  ],
                ))
              : RefreshIndicator(
                  onRefresh: () async => _loadCafes(),
                  color: AppColors.primary,
                  child: ListView.builder(
                    padding: EdgeInsets.all(20),
                    physics: BouncingScrollPhysics(parent: AlwaysScrollableScrollPhysics()),
                    itemCount: _cafes.length,
                    itemBuilder: (context, i) {
                      final cafe = _cafes[i];
                      final img = _imgUrl(cafe['image_url']);
                      return GestureDetector(
                        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CafeDetail(cafeId: cafe['id']))),
                        child: Container(
                          margin: EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 15, offset: Offset(0, 6))],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              ClipRRect(
                                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                                child: SizedBox(
                                  height: 160,
                                  child: img.isNotEmpty
                                      ? Image.network(img, fit: BoxFit.cover, errorBuilder: (_,__,___) => _placeholder())
                                      : _placeholder(),
                                ),
                              ),
                              Padding(
                                padding: EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(child: Text(cafe['name'], style: GoogleFonts.cairo(fontWeight: FontWeight.w900, fontSize: 18, color: AppColors.textPrimary))),
                                        Container(
                                          padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                          decoration: BoxDecoration(color: AppColors.warning.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                                          child: Row(children: [
                                            Text('${cafe['rating'] ?? '4.8'}', style: GoogleFonts.cairo(fontWeight: FontWeight.w800, color: AppColors.warning)),
                                            SizedBox(width: 4),
                                            Icon(Icons.star_rounded, color: AppColors.warning, size: 16),
                                          ]),
                                        )
                                      ],
                                    ),
                                    SizedBox(height: 8),
                                    Row(children: [
                                      Icon(Icons.location_on_rounded, color: AppColors.textSecondary, size: 16),
                                      SizedBox(width: 6),
                                      Expanded(child: Text(cafe['address'] ?? 'غير محدد', style: GoogleFonts.cairo(color: AppColors.textSecondary, fontSize: 13), maxLines: 1)),
                                    ]),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  Widget _placeholder() => Container(color: AppColors.primaryLight, child: Center(child: Icon(Icons.coffee, color: AppColors.primary, size: 48)));
}
