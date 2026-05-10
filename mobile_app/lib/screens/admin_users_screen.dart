import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';

class AdminUsersScreen extends StatefulWidget {
  @override
  _AdminUsersScreenState createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  List _users = [];
  List _filtered = [];
  bool _loading = true;
  String _search = '';
  String _roleFilter = 'user';

  @override
  void initState() { super.initState(); _load(); }

  void _load() async {
    try {
      final res = await ApiService.get('/users');
      if (res.statusCode == 200 && mounted) {
        final all = jsonDecode(res.body) as List;
        setState(() {
          _users = all;
          _applyFilter();
          _loading = false;
        });
      } else if (mounted) setState(() => _loading = false);
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  void _applyFilter() {
    setState(() {
      _filtered = _users.where((u) {
        final matchRole = _roleFilter == 'all' || u['role'] == _roleFilter;
        final matchSearch = _search.isEmpty || (u['name'] ?? '').toString().contains(_search) || (u['email'] ?? '').toString().contains(_search);
        return matchRole && matchSearch;
      }).toList();
    });
  }

  void _showUserActions(Map user) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _UserActionsSheet(user: user, onRefresh: _load),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: Column(
        children: [
          Container(
            padding: EdgeInsets.fromLTRB(20, 60, 20, 20),
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
                Text('إدارة المستخدمين 👥', style: GoogleFonts.cairo(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
                SizedBox(height: 4),
                Text('${_users.length} مستخدم في النظام', style: GoogleFonts.cairo(color: Colors.white70, fontSize: 13)),
                SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.15), borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white.withOpacity(0.25))),
                  child: Row(children: [
                    Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Icon(Icons.search, color: Colors.white70)),
                    Expanded(child: TextField(
                      onChanged: (v) { _search = v; _applyFilter(); },
                      textAlign: TextAlign.right,
                      style: GoogleFonts.cairo(color: Colors.white),
                      decoration: InputDecoration(
                        hintText: 'بحث بالاسم أو البريد...',
                        hintStyle: GoogleFonts.cairo(color: Colors.white60),
                        border: InputBorder.none, enabledBorder: InputBorder.none, focusedBorder: InputBorder.none,
                        filled: false, contentPadding: EdgeInsets.symmetric(vertical: 12),
                      ),
                    )),
                  ]),
                ),
                SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: ['user', 'owner', 'admin', 'all'].map((role) {
                      final isSelected = _roleFilter == role;
                      final labels = {'user': 'المستخدمون', 'owner': 'أصحاب المقاهي', 'admin': 'المشرفون', 'all': 'الكل'};
                      return GestureDetector(
                        onTap: () { _roleFilter = role; _applyFilter(); },
                        child: AnimatedContainer(
                          duration: Duration(milliseconds: 200),
                          margin: EdgeInsets.only(left: 8),
                          padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            color: isSelected ? Colors.white : Colors.white.withOpacity(0.15),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(labels[role]!, style: GoogleFonts.cairo(color: isSelected ? AppColors.primaryDark : Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _filtered.isEmpty
                    ? Center(child: Text('لا يوجد مستخدمون', style: GoogleFonts.cairo(color: AppColors.textMuted)))
                    : RefreshIndicator(
                        onRefresh: () async => _load(),
                        color: AppColors.primary,
                        child: ListView.builder(
                          padding: EdgeInsets.all(16),
                          itemCount: _filtered.length,
                          itemBuilder: (_, i) {
                            final u = _filtered[i];
                            return GestureDetector(
                              onTap: () => _showUserActions(u),
                              child: Container(
                                margin: EdgeInsets.only(bottom: 12),
                                padding: EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(18),
                                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 15, offset: Offset(0, 4))],
                                ),
                                child: Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 24,
                                      backgroundColor: _getRoleColor(u['role']).withOpacity(0.15),
                                      backgroundImage: u['avatar_url'] != null && (u['avatar_url'] as String).isNotEmpty
                                          ? NetworkImage(ApiService.imgUrl(u['avatar_url'])) : null,
                                      child: u['avatar_url'] == null || (u['avatar_url'] as String).isEmpty
                                          ? Text((u['name'] ?? 'م')[0], style: TextStyle(color: _getRoleColor(u['role']), fontWeight: FontWeight.w900, fontSize: 18)) : null,
                                    ),
                                    SizedBox(width: 14),
                                    Expanded(child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Row(children: [
                                          Text(u['name'] ?? '', style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 15)),
                                          SizedBox(width: 8),
                                          Container(
                                            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                            decoration: BoxDecoration(color: _getRoleColor(u['role']).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                                            child: Text(_getRoleLabel(u['role']), style: GoogleFonts.cairo(color: _getRoleColor(u['role']), fontSize: 11, fontWeight: FontWeight.w700)),
                                          ),
                                        ]),
                                        SizedBox(height: 3),
                                        Text(u['email'] ?? '', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 13)),
                                        SizedBox(height: 6),
                                        Row(children: [
                                          _LevelBadge(u['level'] ?? 'برونزي'),
                                          SizedBox(width: 8),
                                          Text('${u['points'] ?? 0} نقطة', style: GoogleFonts.cairo(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13)),
                                        ]),
                                      ],
                                    )),
                                    Icon(Icons.chevron_left_rounded, color: AppColors.textMuted),
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

  Color _getRoleColor(String? role) {
    switch (role) {
      case 'admin': return AppColors.danger;
      case 'owner': return AppColors.reward;
      default: return AppColors.primary;
    }
  }

  String _getRoleLabel(String? role) {
    switch (role) {
      case 'admin': return 'مشرف';
      case 'owner': return 'صاحب مقهى';
      default: return 'مستخدم';
    }
  }
}

class _LevelBadge extends StatelessWidget {
  final String level;
  _LevelBadge(this.level);
  @override
  Widget build(BuildContext context) {
    Color c;
    String emoji;
    switch (level) {
      case 'ذهبي': c = Color(0xFFD4AF37); emoji = '🥇'; break;
      case 'فضي': c = Color(0xFF9E9E9E); emoji = '🥈'; break;
      case 'بلاتيني': c = Color(0xFF7C4DFF); emoji = '💎'; break;
      case 'ألماسي': c = Color(0xFF00BCD4); emoji = '💠'; break;
      default: c = Color(0xFF8D6E63); emoji = '🥉';
    }
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: c.withOpacity(0.1), borderRadius: BorderRadius.circular(8), border: Border.all(color: c.withOpacity(0.3))),
      child: Text('$emoji $level', style: GoogleFonts.cairo(color: c, fontSize: 11, fontWeight: FontWeight.w700)),
    );
  }
}

class _UserActionsSheet extends StatefulWidget {
  final Map user;
  final VoidCallback onRefresh;
  _UserActionsSheet({required this.user, required this.onRefresh});
  @override
  _UserActionsSheetState createState() => _UserActionsSheetState();
}

class _UserActionsSheetState extends State<_UserActionsSheet> {
  final _pointsCtrl = TextEditingController();
  final _reasonCtrl = TextEditingController();
  bool _loading = false;

  void _deductPoints() async {
    final pts = int.tryParse(_pointsCtrl.text);
    if (pts == null || pts <= 0) return;
    setState(() => _loading = true);
    final res = await ApiService.post('/users/${widget.user['id']}/deduct-points', {
      'points': pts, 'reason': _reasonCtrl.text.isNotEmpty ? _reasonCtrl.text : 'خصم إداري',
    });
    setState(() => _loading = false);
    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      Navigator.pop(context);
      widget.onRefresh();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('✅ تم خصم ${pts} نقطة. الرصيد الجديد: ${data['new_points']}', style: GoogleFonts.cairo(fontWeight: FontWeight.w700)),
        backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ));
    }
  }

  void _addPoints() async {
    final pts = int.tryParse(_pointsCtrl.text);
    if (pts == null || pts <= 0) return;
    setState(() => _loading = true);
    final res = await ApiService.post('/users/${widget.user['id']}/add-points', {
      'points': pts, 'reason': _reasonCtrl.text.isNotEmpty ? _reasonCtrl.text : 'منحة إدارية',
    });
    setState(() => _loading = false);
    if (res.statusCode == 200) {
      Navigator.pop(context);
      widget.onRefresh();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('✅ تمت إضافة ${pts} نقطة بنجاح!', style: GoogleFonts.cairo(fontWeight: FontWeight.w700)),
        backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ));
    }
  }

  void _changeLevel(String level) async {
    final res = await ApiService.put('/users/${widget.user['id']}/level', {'level': level});
    if (res.statusCode == 200) {
      Navigator.pop(context);
      widget.onRefresh();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('✅ تم تحديث المستوى إلى $level', style: GoogleFonts.cairo(fontWeight: FontWeight.w700)),
        backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
      padding: EdgeInsets.fromLTRB(24, 20, 24, 40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)))),
          SizedBox(height: 20),
          Row(children: [
            CircleAvatar(radius: 26, backgroundColor: AppColors.primaryLight,
              child: Text((widget.user['name'] ?? 'م')[0], style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w900, fontSize: 20))),
            SizedBox(width: 14),
            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(widget.user['name'] ?? '', style: GoogleFonts.cairo(fontWeight: FontWeight.w900, fontSize: 18)),
              Text(widget.user['email'] ?? '', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 13)),
              Text('${widget.user['points'] ?? 0} نقطة • ${widget.user['level'] ?? 'برونزي'}', style: GoogleFonts.cairo(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13)),
            ])),
          ]),
          SizedBox(height: 24),
          Text('تعديل النقاط', style: GoogleFonts.cairo(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
          SizedBox(height: 12),
          Row(children: [
            Expanded(child: TextField(
              controller: _pointsCtrl,
              keyboardType: TextInputType.number,
              textAlign: TextAlign.center,
              style: GoogleFonts.cairo(fontSize: 20, fontWeight: FontWeight.w800),
              decoration: InputDecoration(hintText: '0', hintStyle: GoogleFonts.cairo(color: AppColors.border), contentPadding: EdgeInsets.symmetric(vertical: 14)),
            )),
          ]),
          SizedBox(height: 10),
          TextField(
            controller: _reasonCtrl,
            textAlign: TextAlign.right,
            style: GoogleFonts.cairo(),
            decoration: InputDecoration(hintText: 'السبب (اختياري)', hintStyle: GoogleFonts.cairo(color: AppColors.textMuted), contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12)),
          ),
          SizedBox(height: 14),
          Row(children: [
            Expanded(child: ElevatedButton.icon(
              onPressed: _loading ? null : _deductPoints,
              icon: Icon(Icons.remove_circle_outline, size: 18),
              label: Text('خصم نقاط', style: GoogleFonts.cairo(fontWeight: FontWeight.w800)),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), padding: EdgeInsets.symmetric(vertical: 14)),
            )),
            SizedBox(width: 12),
            Expanded(child: ElevatedButton.icon(
              onPressed: _loading ? null : _addPoints,
              icon: Icon(Icons.add_circle_outline, size: 18),
              label: Text('منح نقاط', style: GoogleFonts.cairo(fontWeight: FontWeight.w800)),
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.success, foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), padding: EdgeInsets.symmetric(vertical: 14)),
            )),
          ]),
          SizedBox(height: 20),
          Text('تحديد المستوى يدوياً', style: GoogleFonts.cairo(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
          SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: ['برونزي', 'فضي', 'ذهبي', 'بلاتيني', 'ألماسي'].map((lvl) {
              final colors = {'برونزي': Color(0xFF8D6E63), 'فضي': Color(0xFF9E9E9E), 'ذهبي': Color(0xFFD4AF37), 'بلاتيني': Color(0xFF7C4DFF), 'ألماسي': Color(0xFF00BCD4)};
              final emojis = {'برونزي': '🥉', 'فضي': '🥈', 'ذهبي': '🥇', 'بلاتيني': '💎', 'ألماسي': '💠'};
              final isCurrent = widget.user['level'] == lvl;
              return GestureDetector(
                onTap: () => _changeLevel(lvl),
                child: Container(
                  padding: EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: isCurrent ? colors[lvl]! : colors[lvl]!.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: colors[lvl]!.withOpacity(0.4)),
                  ),
                  child: Text('${emojis[lvl]} $lvl', style: GoogleFonts.cairo(color: isCurrent ? Colors.white : colors[lvl]!, fontWeight: FontWeight.w700, fontSize: 13)),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
