import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/screens/spin_wheel.dart';

class RewardsScreen extends StatefulWidget {
  @override
  _RewardsScreenState createState() => _RewardsScreenState();
}

class _RewardsScreenState extends State<RewardsScreen> {
  int _points = 0;
  bool _loading = true;
  List _wallet = [];
  final List<Map> _rewardTiers = [
    {'points': 50, 'title': 'قهوة مجانية ☕', 'desc': 'استبدل نقاطك بكوب قهوة مجاناً في أي مقهى شريك', 'icon': Icons.coffee_rounded, 'color': AppColors.primary},
    {'points': 100, 'title': 'خصم 20% 🎁', 'desc': 'احصل على خصم 20% على طلبك القادم', 'icon': Icons.discount_rounded, 'color': AppColors.reward},
    {'points': 200, 'title': 'وجبة غداء مجانية 🍽️', 'desc': 'وجبة كاملة مجانية من قائمة الطعام', 'icon': Icons.restaurant_rounded, 'color': AppColors.accent},
    {'points': 500, 'title': 'تجربة VIP 👑', 'desc': 'يوم كامل من الخدمات المميزة في أفضل المقاهي', 'icon': Icons.workspace_premium_rounded, 'color': AppColors.primaryDark},
  ];

  @override
  void initState() { super.initState(); _loadPoints(); }

  void _loadPoints() async {
    try {
      final res = await ApiService.get('/gamification/my-points');
      final walletRes = await ApiService.get('/gamification/my-wallet');
      if (res.statusCode == 200 && mounted) {
        final data = jsonDecode(res.body);
        setState(() { 
          _points = data['points'] ?? 0; 
          if (walletRes.statusCode == 200) _wallet = jsonDecode(walletRes.body);
          _loading = false; 
        });
      } else if (mounted) setState(() => _loading = false);
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: _loading
          ? Center(child: CircularProgressIndicator(color: AppColors.primary))
          : CustomScrollView(
              physics: BouncingScrollPhysics(),
              slivers: [
                // Header
                SliverToBoxAdapter(
                  child: Container(
                    padding: EdgeInsets.fromLTRB(28, 60, 28, 40),
                    decoration: BoxDecoration(
                      gradient: AppColors.heroGradient,
                      borderRadius: BorderRadius.vertical(bottom: Radius.circular(40)),
                    ),
                    child: Column(
                      children: [
                        Icon(Icons.emoji_events_rounded, color: Colors.white, size: 52),
                        SizedBox(height: 16),
                        Text('نقاطك المجمعة', style: GoogleFonts.cairo(color: Colors.white.withOpacity(0.8), fontSize: 16)),
                        Text('$_points', style: GoogleFonts.cairo(color: Colors.white, fontSize: 72, fontWeight: FontWeight.w900, height: 1.1)),
                        Text('نقطة', style: GoogleFonts.cairo(color: Colors.white.withOpacity(0.7), fontSize: 18, fontWeight: FontWeight.w600)),
                        SizedBox(height: 24),
                        Container(
                          padding: EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                          decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withOpacity(0.3))),
                          child: Text('قيّم المقاهي واكسب 10 نقاط لكل تقييم!', style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                        ),
                        SizedBox(height: 16),
                        GestureDetector(
                          onTap: () {
                            Navigator.push(context, MaterialPageRoute(builder: (_) => SpinWheel())).then((_) => _loadPoints());
                          },
                          child: Container(
                            padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10, offset: Offset(0, 4))]),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.casino_rounded, color: AppColors.primary),
                                SizedBox(width: 8),
                                Text('جرب دولاب الحظ الآن!', style: GoogleFonts.cairo(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 15)),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                SliverToBoxAdapter(child: SizedBox(height: 32)),

                SliverPadding(
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverToBoxAdapter(
                    child: Text('المكافآت المتاحة 🎁', style: GoogleFonts.cairo(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  ),
                ),
                SliverToBoxAdapter(child: SizedBox(height: 16)),

                SliverPadding(
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (_, i) {
                        final r = _rewardTiers[i];
                        final canClaim = _points >= (r['points'] as int);
                        return Container(
                          margin: EdgeInsets.only(bottom: 14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: canClaim ? (r['color'] as Color).withOpacity(0.3) : AppColors.border),
                            boxShadow: canClaim ? [BoxShadow(color: (r['color'] as Color).withOpacity(0.12), blurRadius: 20, offset: Offset(0, 6))] : [],
                          ),
                          child: Padding(
                            padding: EdgeInsets.all(18),
                            child: Row(
                              children: [
                                Container(
                                  width: 58, height: 58,
                                  decoration: BoxDecoration(color: (r['color'] as Color).withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                                  child: Icon(r['icon'] as IconData, color: r['color'] as Color, size: 28),
                                ),
                                SizedBox(width: 16),
                                Expanded(child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(r['title'] as String, style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.textPrimary)),
                                    SizedBox(height: 4),
                                    Text(r['desc'] as String, style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 13, height: 1.4)),
                                    SizedBox(height: 8),
                                    Text('${r['points']} نقطة مطلوبة', style: GoogleFonts.cairo(color: r['color'] as Color, fontWeight: FontWeight.w700, fontSize: 13)),
                                  ],
                                )),
                                SizedBox(width: 12),
                                if (canClaim)
                                  Container(
                                    padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                    decoration: BoxDecoration(color: r['color'] as Color, borderRadius: BorderRadius.circular(12)),
                                    child: Text('استبدل', style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
                                  )
                                else
                                  Container(
                                    padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                    decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(12)),
                                    child: Text('${(r['points'] as int) - _points}+', style: GoogleFonts.cairo(color: AppColors.textMuted, fontWeight: FontWeight.w700, fontSize: 13)),
                                  ),
                              ],
                            ),
                          ),
                        );
                      },
                      childCount: _rewardTiers.length,
                    ),
                  ),
                ),
                
                if (_wallet.isNotEmpty) ...[
                  SliverToBoxAdapter(child: SizedBox(height: 36)),
                  SliverPadding(
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverToBoxAdapter(
                      child: Text('محفظة هداياي 🛍️', style: GoogleFonts.cairo(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                    ),
                  ),
                  SliverToBoxAdapter(child: SizedBox(height: 16)),
                  SliverPadding(
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (_, i) {
                          final item = _wallet[i];
                          return Container(
                            margin: EdgeInsets.only(bottom: 14),
                            decoration: BoxDecoration(
                              color: AppColors.primaryLight,
                              borderRadius: BorderRadius.circular(16),
                            ),
                            child: ListTile(
                              contentPadding: EdgeInsets.all(12),
                              leading: CircleAvatar(
                                backgroundColor: AppColors.primary.withOpacity(0.2),
                                child: Icon(Icons.redeem_rounded, color: AppColors.primary),
                              ),
                              title: Text(item['value'] ?? 'جائزة', style: GoogleFonts.cairo(fontWeight: FontWeight.bold, fontSize: 16)),
                              subtitle: Text(item['cafe_name'] ?? 'مقهى شريك', style: GoogleFonts.cairo(color: AppColors.primary)),
                              trailing: item['is_used'] == true 
                                 ? Text('مستخدم', style: TextStyle(color: Colors.grey))
                                 : ElevatedButton(
                                     onPressed: () {},
                                     child: Text('استخدام'),
                                     style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                                   )
                            ),
                          );
                        },
                        childCount: _wallet.length,
                      ),
                    ),
                  ),
                ],
                
                SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            ),
    );
  }
}
