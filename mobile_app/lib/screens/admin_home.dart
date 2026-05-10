import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';

class AdminHome extends StatefulWidget {
  @override
  _AdminHomeState createState() => _AdminHomeState();
}

class _AdminHomeState extends State<AdminHome> {
  Map? _stats;
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  void _load() async {
    try {
      final res = await ApiService.get('/analytics/stats');
      if (res.statusCode == 200 && mounted) {
        setState(() { _stats = jsonDecode(res.body); _loading = false; });
      } else if (mounted) setState(() => _loading = false);
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: _loading
          ? Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: () async => _load(),
              color: AppColors.primary,
              child: CustomScrollView(
                physics: BouncingScrollPhysics(),
                slivers: [
                  SliverToBoxAdapter(
                    child: Container(
                      padding: EdgeInsets.fromLTRB(24, 60, 24, 36),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [Color(0xFF1A0A00), Color(0xFF3D1A0A), Color(0xFF8B4513)],
                          begin: Alignment.topRight,
                          end: Alignment.bottomLeft,
                        ),
                        borderRadius: BorderRadius.vertical(bottom: Radius.circular(40)),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                Text('لوحة الإدارة 👑', style: GoogleFonts.cairo(color: Colors.white.withOpacity(0.75), fontSize: 14)),
                                Text('كافيه كونكت', style: GoogleFonts.cairo(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900)),
                              ]),
                              Container(
                                padding: EdgeInsets.all(12),
                                decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), shape: BoxShape.circle),
                                child: Icon(Icons.admin_panel_settings_rounded, color: Colors.white, size: 24),
                              ),
                            ],
                          ),
                          SizedBox(height: 28),
                          SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            physics: BouncingScrollPhysics(),
                            child: Row(
                              children: [
                                _HeroStat('${_stats?['totalUsers'] ?? 0}', 'مستخدم', Icons.people_rounded, Color(0xFF4FC3F7)),
                                SizedBox(width: 12),
                                _HeroStat('${_stats?['totalCafes'] ?? 0}', 'مقهى', Icons.coffee_rounded, Color(0xFF81C784)),
                                SizedBox(width: 12),
                                _HeroStat('${_stats?['pendingModeration'] ?? 0}', 'بانتظار', Icons.pending_rounded, Color(0xFFFFB74D)),
                                SizedBox(width: 12),
                                _HeroStat('${_stats?['totalPoints'] ?? 0}', 'نقاط', Icons.stars_rounded, Color(0xFFCE93D8)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  SliverToBoxAdapter(child: SizedBox(height: 28)),

                  // Stats Grid
                  SliverPadding(
                    padding: EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverToBoxAdapter(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('نظرة عامة', style: GoogleFonts.cairo(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                          SizedBox(height: 16),
                          GridView.count(
                            crossAxisCount: 2,
                            crossAxisSpacing: 14,
                            mainAxisSpacing: 14,
                            shrinkWrap: true,
                            physics: NeverScrollableScrollPhysics(),
                            childAspectRatio: 1.4,
                            children: [
                              _StatCard('المستخدمون', '${_stats?['totalUsers'] ?? 0}', Icons.person_rounded, AppColors.primary),
                              _StatCard('أصحاب المقاهي', '${_stats?['totalOwners'] ?? 0}', Icons.store_rounded, AppColors.reward),
                              _StatCard('المقاهي', '${_stats?['totalCafes'] ?? 0}', Icons.coffee_rounded, AppColors.accent),
                              _StatCard('المنتجات', '${_stats?['totalProducts'] ?? 0}', Icons.restaurant_menu_rounded, AppColors.secondary),
                              _StatCard('التقييمات', '${_stats?['totalReviews'] ?? 0}', Icons.star_rounded, AppColors.warning),
                              _StatCard('الإشعارات', '${_stats?['totalNotifications'] ?? 0}', Icons.campaign_rounded, Color(0xFF7C4DFF)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  SliverToBoxAdapter(child: SizedBox(height: 24)),

                  // Top Users
                  if (_stats?['topUsers'] != null && (_stats!['topUsers'] as List).isNotEmpty) ...[
                    SliverPadding(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      sliver: SliverToBoxAdapter(
                        child: Text('🏆 أعلى المستخدمين نقاطاً', style: GoogleFonts.cairo(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                      ),
                    ),
                    SliverToBoxAdapter(child: SizedBox(height: 12)),
                    SliverPadding(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      sliver: SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (_, i) {
                            final u = (_stats!['topUsers'] as List)[i];
                            final medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
                            return Container(
                              margin: EdgeInsets.only(bottom: 10),
                              padding: EdgeInsets.all(14),
                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
                              child: Row(
                                children: [
                                  Text(medals[i], style: TextStyle(fontSize: 22)),
                                  SizedBox(width: 12),
                                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                    Text(u['name'] ?? '', style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 15)),
                                    Text(_getLevelLabel(u['level'] ?? 'برونزي'), style: GoogleFonts.cairo(color: _getLevelColor(u['level'] ?? 'برونزي'), fontSize: 12, fontWeight: FontWeight.w700)),
                                  ])),
                                  Container(
                                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(gradient: AppColors.caramelGradient, borderRadius: BorderRadius.circular(10)),
                                    child: Text('${u['points']} نقطة', style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
                                  ),
                                ],
                              ),
                            );
                          },
                          childCount: (_stats!['topUsers'] as List).length,
                        ),
                      ),
                    ),
                  ],

                  // Level Distribution
                  if (_stats?['levelDistribution'] != null && (_stats!['levelDistribution'] as List).isNotEmpty) ...[
                    SliverToBoxAdapter(child: SizedBox(height: 24)),
                    SliverPadding(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      sliver: SliverToBoxAdapter(
                        child: Text('📊 توزيع المستويات', style: GoogleFonts.cairo(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                      ),
                    ),
                    SliverToBoxAdapter(child: SizedBox(height: 12)),
                    SliverPadding(
                      padding: EdgeInsets.symmetric(horizontal: 20),
                      sliver: SliverToBoxAdapter(
                        child: Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: (_stats!['levelDistribution'] as List).map((lv) {
                            return Container(
                              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                              decoration: BoxDecoration(
                                color: _getLevelColor(lv['level'] ?? 'برونزي').withOpacity(0.1),
                                borderRadius: BorderRadius.circular(14),
                                border: Border.all(color: _getLevelColor(lv['level'] ?? 'برونزي').withOpacity(0.3)),
                              ),
                              child: Row(mainAxisSize: MainAxisSize.min, children: [
                                Text(_getLevelEmoji(lv['level'] ?? 'برونزي'), style: TextStyle(fontSize: 16)),
                                SizedBox(width: 6),
                                Text('${lv['level']}: ${lv['count']}', style: GoogleFonts.cairo(fontWeight: FontWeight.w700, color: _getLevelColor(lv['level'] ?? 'برونزي'))),
                              ]),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                  ],

                  SliverToBoxAdapter(child: SizedBox(height: 100)),
                ],
              ),
            ),
    );
  }

  String _getLevelLabel(String level) {
    switch (level) {
      case 'ذهبي': return '⭐ عضو ذهبي';
      case 'فضي': return '🥈 عضو فضي';
      case 'بلاتيني': return '💎 عضو بلاتيني';
      case 'ألماسي': return '💠 عضو ألماسي';
      default: return '🥉 عضو برونزي';
    }
  }

  Color _getLevelColor(String level) {
    switch (level) {
      case 'ذهبي': return Color(0xFFD4AF37);
      case 'فضي': return Color(0xFF9E9E9E);
      case 'بلاتيني': return Color(0xFF7C4DFF);
      case 'ألماسي': return Color(0xFF00BCD4);
      default: return Color(0xFF8D6E63);
    }
  }

  String _getLevelEmoji(String level) {
    switch (level) {
      case 'ذهبي': return '🥇';
      case 'فضي': return '🥈';
      case 'بلاتيني': return '💎';
      case 'ألماسي': return '💠';
      default: return '🥉';
    }
  }
}

class _HeroStat extends StatelessWidget {
  final String value, label;
  final IconData icon;
  final Color color;
  _HeroStat(this.value, this.label, this.icon, this.color);
  @override
  Widget build(BuildContext context) => Container(
    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
    decoration: BoxDecoration(color: Colors.white.withOpacity(0.12), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withOpacity(0.2))),
    child: Column(
      children: [
        Icon(icon, color: color, size: 22),
        SizedBox(height: 6),
        Text(value, style: GoogleFonts.cairo(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
        Text(label, style: GoogleFonts.cairo(color: Colors.white.withOpacity(0.7), fontSize: 12)),
      ],
    ),
  );
}

class _StatCard extends StatelessWidget {
  final String label, value;
  final IconData icon;
  final Color color;
  _StatCard(this.label, this.value, this.icon, this.color);
  @override
  Widget build(BuildContext context) => Container(
    padding: EdgeInsets.all(18),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      boxShadow: [BoxShadow(color: color.withOpacity(0.1), blurRadius: 20, offset: Offset(0, 6))],
      border: Border.all(color: color.withOpacity(0.15)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Container(
          padding: EdgeInsets.all(8),
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: color, size: 20),
        ),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(value, style: GoogleFonts.cairo(fontSize: 26, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
            Text(label, style: GoogleFonts.cairo(fontSize: 12, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
          ],
        ),
      ],
    ),
  );
}
