import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/screens/owner_wheel_management.dart';

class OwnerHome extends StatefulWidget {
  @override
  _OwnerHomeState createState() => _OwnerHomeState();
}

class _OwnerHomeState extends State<OwnerHome> {
  Map? _cafe;
  List _products = [];
  int _reviewCount = 0;
  bool _isLoading = true;

  @override
  void initState() { super.initState(); _loadData(); }

  void _loadData() async {
    try {
      final res = await ApiService.get('/cafes/my-cafe');
      if (res.statusCode == 200 && mounted) {
        final cafe = jsonDecode(res.body);
        final prodRes = await ApiService.get('/products/cafe/${cafe['id']}');
        final revRes = await ApiService.get('/reviews/cafe/${cafe['id']}');
        setState(() {
          _cafe = cafe;
          _products = prodRes.statusCode == 200 ? jsonDecode(prodRes.body) : [];
          _reviewCount = revRes.statusCode == 200 ? jsonDecode(revRes.body).length : 0;
          _isLoading = false;
        });
      } else if (mounted) setState(() => _isLoading = false);
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  String _imgUrl(String? url) {
    if (url == null || url.isEmpty) return '';
    if (url.startsWith('/')) return 'http://localhost:5000$url';
    return url;
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return Container(color: AppColors.bg, child: Center(child: CircularProgressIndicator(color: AppColors.primary)));

    return Scaffold(
      backgroundColor: AppColors.bg,
      body: _cafe == null
          ? Center(child: Padding(padding: EdgeInsets.all(40), child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(Icons.storefront_outlined, size: 80, color: Colors.grey[300]),
              SizedBox(height: 16),
              Text('لا يوجد مقهى مسجل', style: GoogleFonts.cairo(fontSize: 20, fontWeight: FontWeight.w800)),
              SizedBox(height: 8),
              Text('انتقل لتبويب "ملف المقهى" لإعداد مقهاك.', textAlign: TextAlign.center, style: GoogleFonts.cairo(color: AppColors.textMuted)),

            ])))
          : RefreshIndicator(
              onRefresh: () async => _loadData(),
              color: AppColors.primary,
              child: SingleChildScrollView(
                physics: AlwaysScrollableScrollPhysics(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Hero Header
                    Container(
                      padding: EdgeInsets.fromLTRB(28, 60, 28, 40),
                      decoration: BoxDecoration(gradient: AppColors.heroGradient, borderRadius: BorderRadius.vertical(bottom: Radius.circular(40))),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('مرحباً! 👋', style: GoogleFonts.cairo(color: Colors.white.withOpacity(0.75), fontSize: 15)),
                          Text(_cafe!['name'], style: GoogleFonts.cairo(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w900)),
                          SizedBox(height: 6),
                          Row(children: [
                            Icon(Icons.location_on_rounded, color: Colors.white70, size: 15),
                            SizedBox(width: 4),
                            Text(_cafe!['address'] ?? 'العنوان غير محدد', style: GoogleFonts.cairo(color: Colors.white.withOpacity(0.7), fontSize: 14)),
                          ]),
                          SizedBox(height: 28),
                          // Stats Row
                          Row(
                            children: [
                              _StatBadge('${_products.length}', 'منتج', Icons.shopping_bag_outlined),
                              SizedBox(width: 12),
                              _StatBadge('$_reviewCount', 'تقييم', Icons.star_outline_rounded),
                              SizedBox(width: 12),
                              _StatBadge('--', 'نقطة', Icons.emoji_events_outlined),
                            ],
                          ),
                          SizedBox(height: 24),
                          SizedBox(
                            width: double.infinity,
                            height: 50,
                            child: ElevatedButton.icon(
                              onPressed: () {
                                Navigator.push(context, MaterialPageRoute(builder: (_) => OwnerWheelManagementScreen()));
                              },
                              icon: Icon(Icons.casino_rounded),
                              label: Text('إدارة جوائز دولاب الحظ', style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 16)),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.white.withOpacity(0.2),
                                foregroundColor: Colors.white,
                                elevation: 0,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.white.withOpacity(0.4))),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    SizedBox(height: 32),
                    Padding(
                      padding: EdgeInsets.symmetric(horizontal: 24),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('المنتجات النشطة', style: GoogleFonts.cairo(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                          Container(
                            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(12)),
                            child: Text('${_products.length} صنف', style: GoogleFonts.cairo(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13)),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: 16),
                    ListView.builder(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      itemCount: _products.length,
                      itemBuilder: (_, i) {
                        final p = _products[i];
                        final img = _imgUrl(p['image_url']);
                        return Container(
                          margin: EdgeInsets.only(bottom: 14),
                          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.border)),
                          child: ListTile(
                            contentPadding: EdgeInsets.all(14),
                            leading: ClipRRect(
                              borderRadius: BorderRadius.circular(14),
                              child: SizedBox(width: 58, height: 58, child: img.isNotEmpty ? Image.network(img, fit: BoxFit.cover, errorBuilder: (_,__,___) => _productPlaceholder()) : _productPlaceholder()),
                            ),
                            title: Text(p['name'], style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.textPrimary)),
                            subtitle: Text(p['description'] ?? '—', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                            trailing: Container(padding: EdgeInsets.all(8), decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)), child: Icon(Icons.edit_note_rounded, color: AppColors.primary, size: 18)),
                          ),
                        );
                      },
                    ),
                    SizedBox(height: 100),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _productPlaceholder() => Container(color: AppColors.primaryLight, child: Center(child: Icon(Icons.coffee, color: AppColors.primary)));
}

class _StatBadge extends StatelessWidget {
  final String value, label;
  final IconData icon;
  _StatBadge(this.value, this.label, this.icon);
  @override
  Widget build(BuildContext context) => Container(
    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
    decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(0.25))),
    child: Row(children: [
      Icon(icon, color: Colors.white, size: 16),
      SizedBox(width: 6),
      Text('$value $label', style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
    ]),
  );
}
