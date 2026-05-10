import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map? _user;
  List _history = [];
  bool _loading = true;
  bool _editing = false;
  bool _saving = false;
  Map? _settings;

  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _cityCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();

  @override
  void initState() { super.initState(); _load(); }

  @override
  void dispose() {
    _nameCtrl.dispose(); _phoneCtrl.dispose();
    _cityCtrl.dispose(); _bioCtrl.dispose();
    super.dispose();
  }

  void _load() async {
    try {
      final res = await ApiService.get('/users/me');
      final histRes = await ApiService.get('/users/points-history');
      final settRes = await ApiService.get('/settings');
      if (mounted) setState(() {
        if (res.statusCode == 200) {
          _user = jsonDecode(res.body);
          _nameCtrl.text = _user!['name'] ?? '';
          _phoneCtrl.text = _user!['phone'] ?? '';
          _cityCtrl.text = _user!['city'] ?? '';
          _bioCtrl.text = _user!['bio'] ?? '';
        }
        if (histRes.statusCode == 200) _history = jsonDecode(histRes.body);
        if (settRes.statusCode == 200) _settings = jsonDecode(settRes.body);
        _loading = false;
      });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  void _save() async {
    setState(() => _saving = true);
    final res = await ApiService.put('/users/me', {
      'name': _nameCtrl.text,
      'phone': _phoneCtrl.text,
      'city': _cityCtrl.text,
      'bio': _bioCtrl.text,
    });
    setState(() => _saving = false);
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      setState(() { _user = data; _editing = false; });
      if (data['points_awarded'] != null) {
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
            content: Column(mainAxisSize: MainAxisSize.min, children: [
              Text('🎉', style: TextStyle(fontSize: 60)),
              SizedBox(height: 12),
              Text('ملفك الشخصي مكتمل!', style: GoogleFonts.cairo(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.textPrimary), textAlign: TextAlign.center),
              SizedBox(height: 8),
              Text('حصلت على ${data['points_awarded']} نقطة مكافأة!', style: GoogleFonts.cairo(color: AppColors.primary, fontSize: 16, fontWeight: FontWeight.w700), textAlign: TextAlign.center),
            ]),
            actions: [ElevatedButton(onPressed: () { Navigator.pop(context); _load(); }, child: Text('رائع! 🚀', style: GoogleFonts.cairo()))],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('✅ تم حفظ الملف الشخصي', style: GoogleFonts.cairo(fontWeight: FontWeight.w700)),
          backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ));
        _load();
      }
    }
  }

  int _getProfileCompletion() {
    if (_user == null) return 0;
    int filled = 0;
    if ((_user!['name'] ?? '').toString().isNotEmpty) filled++;
    if ((_user!['email'] ?? '').toString().isNotEmpty) filled++;
    if ((_user!['phone'] ?? '').toString().isNotEmpty) filled++;
    if ((_user!['city'] ?? '').toString().isNotEmpty) filled++;
    if ((_user!['bio'] ?? '').toString().isNotEmpty) filled++;
    return (filled / 5 * 100).round();
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
                SliverToBoxAdapter(
                  child: Container(
                    padding: EdgeInsets.fromLTRB(24, 60, 24, 32),
                    decoration: BoxDecoration(
                      gradient: AppColors.heroGradient,
                      borderRadius: BorderRadius.vertical(bottom: Radius.circular(40)),
                    ),
                    child: Column(
                      children: [
                        // Avatar
                        Stack(
                          children: [
                            Container(
                              width: 88, height: 88,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: AppColors.caramelGradient,
                                boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 20, offset: Offset(0, 8))],
                              ),
                              child: Center(child: Text(
                                (_user?['name'] ?? 'م')[0].toUpperCase(),
                                style: GoogleFonts.cairo(color: Colors.white, fontSize: 36, fontWeight: FontWeight.w900),
                              )),
                            ),
                            if (_user?['profile_completed'] == true)
                              Positioned(bottom: 0, right: 0, child: Container(
                                padding: EdgeInsets.all(4),
                                decoration: BoxDecoration(color: AppColors.success, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)),
                                child: Icon(Icons.check, color: Colors.white, size: 12),
                              )),
                          ],
                        ),
                        SizedBox(height: 14),
                        Text(_user?['name'] ?? '', style: GoogleFonts.cairo(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
                        Text(_user?['email'] ?? '', style: GoogleFonts.cairo(color: Colors.white70, fontSize: 14)),
                        SizedBox(height: 16),
                        _LevelBadgeWidget(level: _user?['level'] ?? 'برونزي'),
                        SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _ProfileStat('${_user?['points'] ?? 0}', 'نقطة', Icons.stars_rounded, AppColors.accent),
                            SizedBox(width: 20),
                            _ProfileStat(
                              _settings != null ? '${(((_user?['points'] ?? 0) as int) * (double.tryParse(_settings!['points_to_shekel_rate'] ?? '0.1') ?? 0.1)).toStringAsFixed(2)} ₪' : '---',
                              'قيمة', Icons.account_balance_wallet_rounded, AppColors.reward
                            ),
                            SizedBox(width: 20),
                            _ProfileStat('$_getProfileCompletion%', 'اكتمال', Icons.person_rounded, AppColors.primary),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                // Profile Completion Bar
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(20, 20, 20, 0),
                    child: Container(
                      padding: EdgeInsets.all(18),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: Offset(0, 4))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                            Text('اكتمال الملف الشخصي', style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 15)),
                            Text('${_getProfileCompletion()}%', style: GoogleFonts.cairo(fontWeight: FontWeight.w900, color: AppColors.primary, fontSize: 16)),
                          ]),
                          SizedBox(height: 10),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: LinearProgressIndicator(
                              value: _getProfileCompletion() / 100,
                              backgroundColor: AppColors.border,
                              valueColor: AlwaysStoppedAnimation(AppColors.primary),
                              minHeight: 10,
                            ),
                          ),
                          if (_user?['profile_completed'] != true) ...[
                            SizedBox(height: 8),
                            Row(children: [
                              Icon(Icons.info_outline, color: AppColors.warning, size: 14),
                              SizedBox(width: 6),
                              Expanded(child: Text(
                                'أكمل ملفك الشخصي لتحصل على ${_settings?['profile_completion_points'] ?? 50} نقطة مجانية!',
                                style: GoogleFonts.cairo(color: AppColors.warning, fontSize: 12, fontWeight: FontWeight.w700),
                              )),
                            ]),
                          ] else ...[
                            SizedBox(height: 8),
                            Row(children: [
                              Icon(Icons.check_circle, color: AppColors.success, size: 14),
                              SizedBox(width: 6),
                              Text('ملفك الشخصي مكتمل! تم منح النقاط', style: GoogleFonts.cairo(color: AppColors.success, fontSize: 12, fontWeight: FontWeight.w700)),
                            ]),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),

                // Profile Fields
                SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.fromLTRB(20, 16, 20, 0),
                    child: Container(
                      padding: EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: Offset(0, 4))],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                            Text('معلوماتي الشخصية', style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 16)),
                            GestureDetector(
                              onTap: () => setState(() => _editing = !_editing),
                              child: Container(
                                padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                decoration: BoxDecoration(
                                  gradient: _editing ? null : AppColors.caramelGradient,
                                  color: _editing ? AppColors.bg : null,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Text(_editing ? 'إلغاء' : 'تعديل', style: GoogleFonts.cairo(color: _editing ? AppColors.textMuted : Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                              ),
                            ),
                          ]),
                          SizedBox(height: 16),
                          _ProfileField(label: 'الاسم الكامل', icon: Icons.person_outline, ctrl: _nameCtrl, editing: _editing, required: true),
                          SizedBox(height: 12),
                          _ProfileField(label: 'رقم الهاتف', icon: Icons.phone_outlined, ctrl: _phoneCtrl, editing: _editing, keyboard: TextInputType.phone, required: true),
                          SizedBox(height: 12),
                          _ProfileField(label: 'المدينة', icon: Icons.location_city_outlined, ctrl: _cityCtrl, editing: _editing, required: true),
                          SizedBox(height: 12),
                          _ProfileField(label: 'نبذة عني', icon: Icons.description_outlined, ctrl: _bioCtrl, editing: _editing, maxLines: 3, required: true),
                          if (_editing) ...[
                            SizedBox(height: 20),
                            SizedBox(
                              width: double.infinity,
                              height: 52,
                              child: ElevatedButton(
                                onPressed: _saving ? null : _save,
                                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), elevation: 0),
                                child: _saving
                                    ? SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                                    : Text('حفظ التعديلات', style: GoogleFonts.cairo(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),

                // Points History
                if (_history.isNotEmpty) ...[
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: EdgeInsets.fromLTRB(20, 16, 20, 0),
                      child: Text('سجل النقاط', style: GoogleFonts.cairo(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                    ),
                  ),
                  SliverPadding(
                    padding: EdgeInsets.fromLTRB(20, 12, 20, 0),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (_, i) {
                          final h = _history[i];
                          final isPositive = (h['points_change'] ?? 0) > 0;
                          return Container(
                            margin: EdgeInsets.only(bottom: 10),
                            padding: EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: isPositive ? AppColors.success.withOpacity(0.1) : AppColors.danger.withOpacity(0.1),
                                    shape: BoxShape.circle,
                                  ),
                                  child: Icon(isPositive ? Icons.add_rounded : Icons.remove_rounded,
                                    color: isPositive ? AppColors.success : AppColors.danger, size: 16),
                                ),
                                SizedBox(width: 12),
                                Expanded(child: Text(_getReasonLabel(h['reason'] ?? ''), style: GoogleFonts.cairo(fontWeight: FontWeight.w700, fontSize: 14))),
                                Text(
                                  '${isPositive ? '+' : ''}${h['points_change']}',
                                  style: GoogleFonts.cairo(fontWeight: FontWeight.w900, fontSize: 16, color: isPositive ? AppColors.success : AppColors.danger),
                                ),
                              ],
                            ),
                          );
                        },
                        childCount: _history.length,
                      ),
                    ),
                  ),
                ],

                SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            ),
    );
  }

  String _getReasonLabel(String reason) {
    switch (reason) {
      case 'review_approval': return '⭐ تقييم مقهى مقبول';
      case 'spin_wheel': return '🎡 دولاب الحظ';
      case 'profile_completion': return '👤 اكتمال الملف الشخصي';
      case 'admin_deduction': return '📉 خصم إداري';
      case 'admin_grant': return '🎁 منحة من الإدارة';
      default: return reason;
    }
  }

  int _getProfileCompletion() {
    if (_user == null) return 0;
    int filled = 0;
    if ((_user!['name'] ?? '').toString().isNotEmpty) filled++;
    if ((_user!['email'] ?? '').toString().isNotEmpty) filled++;
    if ((_user!['phone'] ?? '').toString().isNotEmpty) filled++;
    if ((_user!['city'] ?? '').toString().isNotEmpty) filled++;
    if ((_user!['bio'] ?? '').toString().isNotEmpty) filled++;
    return (filled / 5 * 100).round();
  }
}

class _ProfileField extends StatelessWidget {
  final String label;
  final IconData icon;
  final TextEditingController ctrl;
  final bool editing;
  final int maxLines;
  final TextInputType? keyboard;
  final bool required;
  _ProfileField({required this.label, required this.icon, required this.ctrl, required this.editing, this.maxLines = 1, this.keyboard, this.required = false});
  @override
  Widget build(BuildContext context) {
    if (!editing) {
      return Row(
        children: [
          Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(10)),
            child: Icon(icon, color: AppColors.primary, size: 16),
          ),
          SizedBox(width: 12),
          Expanded(child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: GoogleFonts.cairo(fontSize: 11, color: AppColors.textMuted, fontWeight: FontWeight.w600)),
              Text(ctrl.text.isEmpty ? 'غير محدد' : ctrl.text,
                style: GoogleFonts.cairo(fontWeight: FontWeight.w700, fontSize: 14, color: ctrl.text.isEmpty ? AppColors.border : AppColors.textPrimary)),
            ],
          )),
          if (required && ctrl.text.isEmpty) Icon(Icons.radio_button_unchecked, color: AppColors.warning, size: 16),
          if (required && ctrl.text.isNotEmpty) Icon(Icons.check_circle, color: AppColors.success, size: 16),
        ],
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.cairo(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
        SizedBox(height: 6),
        TextField(
          controller: ctrl,
          textAlign: TextAlign.right,
          maxLines: maxLines,
          keyboardType: keyboard,
          style: GoogleFonts.cairo(),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, color: AppColors.textMuted, size: 20),
            hintStyle: GoogleFonts.cairo(color: AppColors.textMuted),
          ),
        ),
      ],
    );
  }
}

class _ProfileStat extends StatelessWidget {
  final String value, label;
  final IconData icon;
  final Color color;
  _ProfileStat(this.value, this.label, this.icon, this.color);
  @override
  Widget build(BuildContext context) => Column(
    children: [
      Icon(icon, color: color, size: 18),
      SizedBox(height: 4),
      Text(value, style: GoogleFonts.cairo(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w900)),
      Text(label, style: GoogleFonts.cairo(color: Colors.white60, fontSize: 11)),
    ],
  );
}

class _LevelBadgeWidget extends StatelessWidget {
  final String level;
  _LevelBadgeWidget({required this.level});
  @override
  Widget build(BuildContext context) {
    final configs = {
      'برونزي': {'emoji': '🥉', 'color': Color(0xFF8D6E63)},
      'فضي': {'emoji': '🥈', 'color': Color(0xFF9E9E9E)},
      'ذهبي': {'emoji': '🥇', 'color': Color(0xFFD4AF37)},
      'بلاتيني': {'emoji': '💎', 'color': Color(0xFF7C4DFF)},
      'ألماسي': {'emoji': '💠', 'color': Color(0xFF00BCD4)},
    };
    final cfg = configs[level] ?? configs['برونزي']!;
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: (cfg['color'] as Color).withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: (cfg['color'] as Color).withOpacity(0.5)),
      ),
      child: Text('${cfg['emoji']} عضو $level', style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 14)),
    );
  }
}
