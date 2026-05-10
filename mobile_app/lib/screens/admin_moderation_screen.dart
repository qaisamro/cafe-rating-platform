import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';

class AdminModerationScreen extends StatefulWidget {
  @override
  _AdminModerationScreenState createState() => _AdminModerationScreenState();
}

class _AdminModerationScreenState extends State<AdminModerationScreen> {
  List _reviews = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  void _load() async {
    try {
      final res = await ApiService.get('/reviews/moderation');
      if (res.statusCode == 200 && mounted) {
        setState(() { _reviews = jsonDecode(res.body); _loading = false; });
      } else if (mounted) setState(() => _loading = false);
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  void _moderate(int id, bool approve) async {
    final res = await ApiService.put('/reviews/$id/moderate', {'approved': approve});
    if (res.statusCode == 200) {
      _load();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(approve ? '✅ تم قبول التقييم ومنح النقاط!' : '❌ تم رفض التقييم', style: GoogleFonts.cairo(fontWeight: FontWeight.w700)),
        backgroundColor: approve ? AppColors.success : AppColors.danger,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.fromLTRB(24, 60, 24, 24),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF1A0A00), Color(0xFF3D1A0A), Color(0xFF8B4513)],
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
              ),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(30)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('مراجعة التقييمات ⭐', style: GoogleFonts.cairo(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                  Text('${_reviews.length} بانتظار الموافقة', style: GoogleFonts.cairo(color: Colors.white70, fontSize: 13)),
                ]),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(12)),
                  child: Text('${_reviews.length}', style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 20)),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _reviews.isEmpty
                    ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Icon(Icons.check_circle_outline_rounded, size: 80, color: AppColors.success.withOpacity(0.5)),
                        SizedBox(height: 16),
                        Text('لا توجد تقييمات معلقة 🎉', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 18, fontWeight: FontWeight.w700)),
                      ]))
                    : RefreshIndicator(
                        onRefresh: () async => _load(),
                        color: AppColors.primary,
                        child: ListView.builder(
                          padding: EdgeInsets.all(16),
                          itemCount: _reviews.length,
                          itemBuilder: (_, i) {
                            final r = _reviews[i];
                            return Container(
                              margin: EdgeInsets.only(bottom: 14),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: Offset(0, 4))],
                              ),
                              child: Padding(
                                padding: EdgeInsets.all(18),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(children: [
                                          CircleAvatar(backgroundColor: AppColors.primaryLight, radius: 18,
                                            child: Text((r['user_name'] ?? 'م')[0], style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800))),
                                          SizedBox(width: 10),
                                          Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                            Text(r['user_name'] ?? 'مستخدم', style: GoogleFonts.cairo(fontWeight: FontWeight.w700, fontSize: 14)),
                                            Text(r['cafe_name'] ?? '', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 12)),
                                          ]),
                                        ]),
                                        Row(children: List.generate(5, (s) => Icon(
                                          s < (r['rating'] ?? 0) ? Icons.star_rounded : Icons.star_outline_rounded,
                                          color: AppColors.warning, size: 16,
                                        ))),
                                      ],
                                    ),
                                    if (r['comment'] != null && (r['comment'] as String).isNotEmpty) ...[
                                      SizedBox(height: 12),
                                      Container(
                                        padding: EdgeInsets.all(12),
                                        decoration: BoxDecoration(color: AppColors.bg, borderRadius: BorderRadius.circular(12), border: Border(right: BorderSide(color: AppColors.primary, width: 3))),
                                        child: Text(r['comment'], style: GoogleFonts.cairo(color: AppColors.textSecondary, height: 1.5, fontSize: 14)),
                                      ),
                                    ],
                                    SizedBox(height: 14),
                                    Row(children: [
                                      Expanded(child: ElevatedButton.icon(
                                        onPressed: () => _moderate(r['id'], false),
                                        icon: Icon(Icons.close_rounded, size: 16),
                                        label: Text('رفض', style: GoogleFonts.cairo(fontWeight: FontWeight.w800)),
                                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger.withOpacity(0.1), foregroundColor: AppColors.danger, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                                      )),
                                      SizedBox(width: 10),
                                      Expanded(child: ElevatedButton.icon(
                                        onPressed: () => _moderate(r['id'], true),
                                        icon: Icon(Icons.check_rounded, size: 16),
                                        label: Text('قبول + نقاط', style: GoogleFonts.cairo(fontWeight: FontWeight.w800)),
                                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, foregroundColor: Colors.white, elevation: 0, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                                      )),
                                    ]),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
