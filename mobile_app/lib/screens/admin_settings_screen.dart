import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';

class AdminSettingsScreen extends StatefulWidget {
  @override
  _AdminSettingsScreenState createState() => _AdminSettingsScreenState();
}

class _AdminSettingsScreenState extends State<AdminSettingsScreen> {
  Map<String, TextEditingController> _controllers = {};
  bool _loading = true;
  bool _saving = false;

  final _keys = {
    'points_to_shekel_rate': 'سعر تحويل النقطة (شيكل)',
    'level_silver_min': 'حد الفضي (نقطة)',
    'level_gold_min': 'حد الذهبي (نقطة)',
    'level_platinum_min': 'حد البلاتيني (نقطة)',
    'level_diamond_min': 'حد الألماسي (نقطة)',
    'profile_completion_points': 'نقاط اكتمال الملف الشخصي',
    'review_points': 'نقاط التقييم الافتراضية',
  };

  final _icons = {
    'points_to_shekel_rate': Icons.currency_exchange_rounded,
    'level_silver_min': Icons.workspace_premium_rounded,
    'level_gold_min': Icons.emoji_events_rounded,
    'level_platinum_min': Icons.diamond_rounded,
    'level_diamond_min': Icons.auto_awesome_rounded,
    'profile_completion_points': Icons.person_rounded,
    'review_points': Icons.star_rounded,
  };

  final _colors = {
    'points_to_shekel_rate': Color(0xFF00BCD4),
    'level_silver_min': Color(0xFF9E9E9E),
    'level_gold_min': Color(0xFFD4AF37),
    'level_platinum_min': Color(0xFF7C4DFF),
    'level_diamond_min': Color(0xFF00E5FF),
    'profile_completion_points': AppColors.primary,
    'review_points': AppColors.warning,
  };

  @override
  void initState() {
    super.initState();
    for (final k in _keys.keys) _controllers[k] = TextEditingController();
    _load();
  }

  @override
  void dispose() {
    for (final c in _controllers.values) c.dispose();
    super.dispose();
  }

  void _load() async {
    try {
      final res = await ApiService.get('/settings');
      if (res.statusCode == 200 && mounted) {
        final data = jsonDecode(res.body) as Map;
        setState(() {
          for (final k in _keys.keys) {
            _controllers[k]!.text = data[k]?.toString() ?? '';
          }
          _loading = false;
        });
      } else if (mounted) setState(() => _loading = false);
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  void _save() async {
    setState(() => _saving = true);
    final data = <String, String>{};
    for (final k in _keys.keys) data[k] = _controllers[k]!.text;
    final res = await ApiService.put('/settings', data);
    setState(() => _saving = false);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(res.statusCode == 200 ? '✅ تم حفظ الإعدادات بنجاح!' : '❌ خطأ في الحفظ', style: GoogleFonts.cairo(fontWeight: FontWeight.w700)),
      backgroundColor: res.statusCode == 200 ? AppColors.success : AppColors.danger,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
    ));

    if (res.statusCode == 200) {
      // Sync all user levels after level threshold changes
      await ApiService.put('/users/sync-levels', {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.fromLTRB(24, 60, 24, 28),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF1A0A00), Color(0xFF3D1A0A), Color(0xFF8B4513)],
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
              ),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(30)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('إعدادات النظام ⚙️', style: GoogleFonts.cairo(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
                SizedBox(height: 4),
                Text('تحكم كامل في قواعد التطبيق', style: GoogleFonts.cairo(color: Colors.white70, fontSize: 13)),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? Center(child: CircularProgressIndicator(color: AppColors.primary))
                : SingleChildScrollView(
                    padding: EdgeInsets.all(20),
                    physics: BouncingScrollPhysics(),
                    child: Column(
                      children: [
                        // Points to Shekel section
                        _SectionHeader('💰 نظام العملة', 'تحديد قيمة النقاط بالشيكل الإسرائيلي'),
                        SizedBox(height: 12),
                        _SettingCard(
                          key_: 'points_to_shekel_rate',
                          label: _keys['points_to_shekel_rate']!,
                          controller: _controllers['points_to_shekel_rate']!,
                          icon: _icons['points_to_shekel_rate']!,
                          color: _colors['points_to_shekel_rate']!,
                          hint: '0.10',
                          suffix: '₪',
                          subtitle: '1 نقطة = X شيكل',
                        ),
                        SizedBox(height: 8),
                        _ConversionPreview(ctrl: _controllers['points_to_shekel_rate']!),
                        SizedBox(height: 24),

                        // Levels section
                        _SectionHeader('🏆 مستويات المستخدمين', 'تحديد عدد النقاط المطلوب لكل مستوى'),
                        SizedBox(height: 12),
                        ...['level_silver_min', 'level_gold_min', 'level_platinum_min', 'level_diamond_min'].map((k) => Padding(
                          padding: EdgeInsets.only(bottom: 12),
                          child: _SettingCard(
                            key_: k,
                            label: _keys[k]!,
                            controller: _controllers[k]!,
                            icon: _icons[k]!,
                            color: _colors[k]!,
                            hint: '100',
                            suffix: 'نقطة',
                          ),
                        )).toList(),
                        SizedBox(height: 12),

                        // Gamification section
                        _SectionHeader('⭐ نظام النقاط', 'تحديد النقاط الممنوحة للأنشطة المختلفة'),
                        SizedBox(height: 12),
                        ...['profile_completion_points', 'review_points'].map((k) => Padding(
                          padding: EdgeInsets.only(bottom: 12),
                          child: _SettingCard(
                            key_: k,
                            label: _keys[k]!,
                            controller: _controllers[k]!,
                            icon: _icons[k]!,
                            color: _colors[k]!,
                            hint: '10',
                            suffix: 'نقطة',
                          ),
                        )).toList(),

                        SizedBox(height: 32),
                        SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: _saving ? null : _save,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                              elevation: 0,
                            ),
                            child: _saving
                                ? SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                : Text('حفظ جميع الإعدادات', style: GoogleFonts.cairo(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.white)),
                          ),
                        ),
                        SizedBox(height: 40),
                      ],
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title, subtitle;
  _SectionHeader(this.title, this.subtitle);
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(title, style: GoogleFonts.cairo(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
      Text(subtitle, style: GoogleFonts.cairo(fontSize: 13, color: AppColors.textMuted)),
    ],
  );
}

class _SettingCard extends StatelessWidget {
  final String key_, label, hint, suffix;
  final String? subtitle;
  final TextEditingController controller;
  final IconData icon;
  final Color color;
  _SettingCard({required this.key_, required this.label, required this.controller, required this.icon, required this.color, required this.hint, required this.suffix, this.subtitle});
  @override
  Widget build(BuildContext context) => Container(
    padding: EdgeInsets.all(18),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      boxShadow: [BoxShadow(color: color.withOpacity(0.08), blurRadius: 15, offset: Offset(0, 4))],
      border: Border.all(color: color.withOpacity(0.2)),
    ),
    child: Row(
      children: [
        Container(
          padding: EdgeInsets.all(10),
          decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
          child: Icon(icon, color: color, size: 22),
        ),
        SizedBox(width: 14),
        Expanded(child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 14, color: AppColors.textPrimary)),
            if (subtitle != null) Text(subtitle!, style: GoogleFonts.cairo(fontSize: 11, color: AppColors.textMuted)),
          ],
        )),
        SizedBox(width: 12),
        SizedBox(
          width: 90,
          child: TextField(
            controller: controller,
            keyboardType: TextInputType.numberWithOptions(decimal: true),
            textAlign: TextAlign.center,
            style: GoogleFonts.cairo(fontWeight: FontWeight.w900, fontSize: 16, color: color),
            decoration: InputDecoration(
              hintText: hint,
              suffixText: suffix,
              suffixStyle: GoogleFonts.cairo(fontSize: 11, color: AppColors.textMuted),
              contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: color.withOpacity(0.3))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: color, width: 2)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: color.withOpacity(0.3))),
              filled: true, fillColor: color.withOpacity(0.04),
            ),
          ),
        ),
      ],
    ),
  );
}

class _ConversionPreview extends StatefulWidget {
  final TextEditingController ctrl;
  _ConversionPreview({required this.ctrl});
  @override
  _ConversionPreviewState createState() => _ConversionPreviewState();
}

class _ConversionPreviewState extends State<_ConversionPreview> {
  @override
  void initState() { super.initState(); widget.ctrl.addListener(() => setState(() {})); }
  @override
  Widget build(BuildContext context) {
    final rate = double.tryParse(widget.ctrl.text) ?? 0.1;
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(color: Color(0xFF00BCD4).withOpacity(0.08), borderRadius: BorderRadius.circular(14), border: Border.all(color: Color(0xFF00BCD4).withOpacity(0.2))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('معاينة التحويل:', style: GoogleFonts.cairo(fontWeight: FontWeight.w700, color: Color(0xFF00BCD4), fontSize: 13)),
          SizedBox(height: 8),
          Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
            _PreviewItem('100 نقطة', '${(100 * rate).toStringAsFixed(2)} ₪'),
            _PreviewItem('500 نقطة', '${(500 * rate).toStringAsFixed(2)} ₪'),
            _PreviewItem('1000 نقطة', '${(1000 * rate).toStringAsFixed(2)} ₪'),
          ]),
        ],
      ),
    );
  }
}

class _PreviewItem extends StatelessWidget {
  final String points, shekel;
  _PreviewItem(this.points, this.shekel);
  @override
  Widget build(BuildContext context) => Column(
    children: [
      Text(points, style: GoogleFonts.cairo(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.textSecondary)),
      Icon(Icons.arrow_downward, size: 14, color: Color(0xFF00BCD4)),
      Text(shekel, style: GoogleFonts.cairo(fontWeight: FontWeight.w900, fontSize: 14, color: Color(0xFF00BCD4))),
    ],
  );
}
