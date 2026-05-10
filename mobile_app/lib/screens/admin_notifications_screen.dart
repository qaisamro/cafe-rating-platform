import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';

class AdminNotificationsScreen extends StatefulWidget {
  @override
  _AdminNotificationsScreenState createState() => _AdminNotificationsScreenState();
}

class _AdminNotificationsScreenState extends State<AdminNotificationsScreen> {
  List _notifications = [];
  List _users = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  void _load() async {
    try {
      final res = await ApiService.get('/notifications');
      final usersRes = await ApiService.get('/users');
      if (mounted) setState(() {
        if (res.statusCode == 200) _notifications = jsonDecode(res.body);
        if (usersRes.statusCode == 200) _users = (jsonDecode(usersRes.body) as List).where((u) => u['role'] == 'user').toList();
        _loading = false;
      });
    } catch (_) { if (mounted) setState(() => _loading = false); }
  }

  void _showSendDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _SendNotificationSheet(users: _users, onSent: _load),
    );
  }

  void _deleteNotification(int id) async {
    final res = await ApiService.delete('/notifications/$id');
    if (res.statusCode == 200) {
      _load();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('تم حذف الإشعار', style: GoogleFonts.cairo()),
        backgroundColor: AppColors.danger, behavior: SnackBarBehavior.floating,
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
                  Text('إدارة الإشعارات 📢', style: GoogleFonts.cairo(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
                  Text('${_notifications.length} إشعار مرسل', style: GoogleFonts.cairo(color: Colors.white70, fontSize: 13)),
                ]),
                ElevatedButton.icon(
                  onPressed: _showSendDialog,
                  icon: Icon(Icons.add, size: 18),
                  label: Text('إرسال', style: GoogleFonts.cairo(fontWeight: FontWeight.w800)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primaryDark,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    elevation: 0,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? Center(child: CircularProgressIndicator(color: AppColors.primary))
                : _notifications.isEmpty
                    ? Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Icon(Icons.notifications_none_rounded, size: 80, color: AppColors.border),
                        SizedBox(height: 16),
                        Text('لا توجد إشعارات مرسلة', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 18, fontWeight: FontWeight.w700)),
                        SizedBox(height: 8),
                        Text('اضغط على "إرسال" لإرسال إشعار جديد', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 14)),
                      ]))
                    : ListView.builder(
                        padding: EdgeInsets.all(16),
                        itemCount: _notifications.length,
                        itemBuilder: (_, i) {
                          final n = _notifications[i];
                          final typeData = _getTypeData(n['type'] ?? 'message');
                          return Dismissible(
                            key: Key('${n['id']}'),
                            direction: DismissDirection.startToEnd,
                            onDismissed: (_) => _deleteNotification(n['id']),
                            background: Container(
                              margin: EdgeInsets.only(bottom: 12),
                              decoration: BoxDecoration(color: AppColors.danger, borderRadius: BorderRadius.circular(18)),
                              alignment: Alignment.centerRight,
                              padding: EdgeInsets.only(right: 20),
                              child: Icon(Icons.delete_rounded, color: Colors.white),
                            ),
                            child: Container(
                              margin: EdgeInsets.only(bottom: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(18),
                                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: Offset(0, 4))],
                              ),
                              child: Padding(
                                padding: EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(children: [
                                      Container(
                                        padding: EdgeInsets.all(8),
                                        decoration: BoxDecoration(color: typeData['color'].withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                                        child: Icon(typeData['icon'], color: typeData['color'], size: 18),
                                      ),
                                      SizedBox(width: 10),
                                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                        Text(n['title'] ?? '', style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 15)),
                                        Row(children: [
                                          Container(
                                            padding: EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: n['target_type'] == 'all' ? AppColors.reward.withOpacity(0.1) : AppColors.primary.withOpacity(0.1),
                                              borderRadius: BorderRadius.circular(6),
                                            ),
                                            child: Text(
                                              n['target_type'] == 'all' ? '🌍 للجميع' : '👤 ${n['target_user_name'] ?? 'فردي'}',
                                              style: GoogleFonts.cairo(fontSize: 11, fontWeight: FontWeight.w700,
                                                color: n['target_type'] == 'all' ? AppColors.reward : AppColors.primary),
                                            ),
                                          ),
                                        ]),
                                      ])),
                                      IconButton(
                                        icon: Icon(Icons.delete_outline, color: AppColors.danger, size: 20),
                                        onPressed: () => _deleteNotification(n['id']),
                                      ),
                                    ]),
                                    if (n['message'] != null && (n['message'] as String).isNotEmpty) ...[
                                      SizedBox(height: 10),
                                      Container(
                                        padding: EdgeInsets.all(12),
                                        decoration: BoxDecoration(color: AppColors.bg, borderRadius: BorderRadius.circular(12)),
                                        child: Text(n['message'], style: GoogleFonts.cairo(color: AppColors.textSecondary, fontSize: 13, height: 1.5)),
                                      ),
                                    ],
                                    if (n['media_url'] != null && (n['media_url'] as String).isNotEmpty) ...[
                                      SizedBox(height: 8),
                                      Row(children: [
                                        Icon(Icons.link_rounded, size: 14, color: AppColors.primary),
                                        SizedBox(width: 4),
                                        Expanded(child: Text(n['media_url'], style: GoogleFonts.cairo(color: AppColors.primary, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                      ]),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }

  Map<String, dynamic> _getTypeData(String type) {
    switch (type) {
      case 'image': return {'icon': Icons.image_rounded, 'color': Color(0xFF4CAF50)};
      case 'video': return {'icon': Icons.videocam_rounded, 'color': Color(0xFFE91E63)};
      case 'link': return {'icon': Icons.link_rounded, 'color': Color(0xFF2196F3)};
      default: return {'icon': Icons.campaign_rounded, 'color': AppColors.primary};
    }
  }
}

class _SendNotificationSheet extends StatefulWidget {
  final List users;
  final VoidCallback onSent;
  _SendNotificationSheet({required this.users, required this.onSent});
  @override
  _SendNotificationSheetState createState() => _SendNotificationSheetState();
}

class _SendNotificationSheetState extends State<_SendNotificationSheet> {
  final _title = TextEditingController();
  final _message = TextEditingController();
  final _mediaUrl = TextEditingController();
  String _type = 'message';
  String _targetType = 'all';
  int? _selectedUserId;
  String? _selectedUserName;
  bool _sending = false;

  void _send() async {
    if (_title.text.isEmpty) return;
    setState(() => _sending = true);
    final data = {
      'title': _title.text,
      'message': _message.text,
      'type': _type,
      'media_url': _mediaUrl.text,
      'target_type': _targetType,
      if (_targetType == 'individual') 'target_user_id': _selectedUserId,
    };
    final res = await ApiService.post('/notifications', data);
    setState(() => _sending = false);
    if (res.statusCode == 201) {
      Navigator.pop(context);
      widget.onSent();
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text('✅ تم إرسال الإشعار بنجاح!', style: GoogleFonts.cairo(fontWeight: FontWeight.w700)),
        backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      ));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(32))),
      padding: EdgeInsets.fromLTRB(24, 20, 24, MediaQuery.of(context).viewInsets.bottom + 40),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.border, borderRadius: BorderRadius.circular(2)))),
            SizedBox(height: 20),
            Text('إرسال إشعار جديد 📣', style: GoogleFonts.cairo(fontSize: 22, fontWeight: FontWeight.w900, color: AppColors.textPrimary)),
            SizedBox(height: 20),

            // Type selector
            Text('نوع الإشعار', style: GoogleFonts.cairo(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
            SizedBox(height: 8),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _TypeChip('message', 'رسالة', Icons.message_rounded, this),
                  SizedBox(width: 8),
                  _TypeChip('image', 'صورة', Icons.image_rounded, this),
                  SizedBox(width: 8),
                  _TypeChip('video', 'فيديو', Icons.videocam_rounded, this),
                  SizedBox(width: 8),
                  _TypeChip('link', 'رابط', Icons.link_rounded, this),
                ],
              ),
            ),
            SizedBox(height: 16),

            // Target
            Text('إرسال إلى', style: GoogleFonts.cairo(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
            SizedBox(height: 8),
            Row(children: [
              Expanded(child: GestureDetector(
                onTap: () => setState(() { _targetType = 'all'; _selectedUserId = null; }),
                child: Container(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    gradient: _targetType == 'all' ? AppColors.caramelGradient : null,
                    color: _targetType != 'all' ? AppColors.bg : null,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: _targetType == 'all' ? Colors.transparent : AppColors.border),
                  ),
                  child: Center(child: Text('🌍 الجميع', style: GoogleFonts.cairo(color: _targetType == 'all' ? Colors.white : AppColors.textMuted, fontWeight: FontWeight.w800))),
                ),
              )),
              SizedBox(width: 10),
              Expanded(child: GestureDetector(
                onTap: () => setState(() => _targetType = 'individual'),
                child: Container(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    gradient: _targetType == 'individual' ? AppColors.caramelGradient : null,
                    color: _targetType != 'individual' ? AppColors.bg : null,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: _targetType == 'individual' ? Colors.transparent : AppColors.border),
                  ),
                  child: Center(child: Text('👤 فردي', style: GoogleFonts.cairo(color: _targetType == 'individual' ? Colors.white : AppColors.textMuted, fontWeight: FontWeight.w800))),
                ),
              )),
            ]),

            if (_targetType == 'individual') ...[
              SizedBox(height: 12),
              GestureDetector(
                onTap: () => _pickUser(),
                child: Container(
                  padding: EdgeInsets.all(14),
                  decoration: BoxDecoration(color: AppColors.bg, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
                  child: Row(children: [
                    Icon(Icons.person_search_rounded, color: AppColors.primary),
                    SizedBox(width: 10),
                    Expanded(child: Text(_selectedUserName ?? 'اختر مستخدماً...', style: GoogleFonts.cairo(color: _selectedUserName != null ? AppColors.textPrimary : AppColors.textMuted))),
                    Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textMuted),
                  ]),
                ),
              ),
            ],

            SizedBox(height: 16),
            _label('عنوان الإشعار *'),
            SizedBox(height: 8),
            TextField(controller: _title, textAlign: TextAlign.right, style: GoogleFonts.cairo(),
              decoration: InputDecoration(hintText: 'مثال: عرض خاص هذا الأسبوع!', hintStyle: GoogleFonts.cairo(color: AppColors.textMuted))),
            SizedBox(height: 14),
            _label('نص الرسالة'),
            SizedBox(height: 8),
            TextField(controller: _message, textAlign: TextAlign.right, maxLines: 3, style: GoogleFonts.cairo(),
              decoration: InputDecoration(hintText: 'اكتب تفاصيل الإشعار هنا...', hintStyle: GoogleFonts.cairo(color: AppColors.textMuted))),
            if (_type != 'message') ...[
              SizedBox(height: 14),
              _label(_type == 'image' ? 'رابط الصورة' : _type == 'video' ? 'رابط الفيديو' : 'الرابط'),
              SizedBox(height: 8),
              TextField(controller: _mediaUrl, textAlign: TextAlign.right, style: GoogleFonts.cairo(),
                keyboardType: TextInputType.url,
                decoration: InputDecoration(hintText: 'https://...', hintStyle: GoogleFonts.cairo(color: AppColors.textMuted), prefixIcon: Icon(Icons.link, color: AppColors.textMuted))),
            ],
            SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: (_sending || (_targetType == 'individual' && _selectedUserId == null)) ? null : _send,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  elevation: 0,
                ),
                child: _sending
                    ? SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                    : Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                        Icon(Icons.send_rounded, color: Colors.white, size: 18),
                        SizedBox(width: 8),
                        Text('إرسال الإشعار', style: GoogleFonts.cairo(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
                      ]),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _pickUser() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text('اختر مستخدماً', style: GoogleFonts.cairo(fontWeight: FontWeight.w800)),
        content: SizedBox(
          width: double.maxFinite,
          height: 300,
          child: ListView.builder(
            itemCount: widget.users.length,
            itemBuilder: (_, i) {
              final u = widget.users[i];
              return ListTile(
                leading: CircleAvatar(backgroundColor: AppColors.primaryLight,
                  child: Text((u['name'] ?? 'م')[0], style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800))),
                title: Text(u['name'] ?? '', style: GoogleFonts.cairo(fontWeight: FontWeight.w700)),
                subtitle: Text(u['email'] ?? '', style: GoogleFonts.cairo(fontSize: 12)),
                onTap: () {
                  setState(() { _selectedUserId = u['id']; _selectedUserName = u['name']; });
                  Navigator.pop(context);
                },
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _label(String t) => Text(t, style: GoogleFonts.cairo(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textSecondary));
}

class _TypeChip extends StatelessWidget {
  final String type, label;
  final IconData icon;
  final _SendNotificationSheetState parent;
  _TypeChip(this.type, this.label, this.icon, this.parent);
  @override
  Widget build(BuildContext context) {
    final active = parent._type == type;
    return GestureDetector(
      onTap: () => parent.setState(() => parent._type = type),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          gradient: active ? AppColors.caramelGradient : null,
          color: active ? null : AppColors.bg,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: active ? Colors.transparent : AppColors.border),
        ),
        child: Row(mainAxisSize: MainAxisSize.min, children: [
          Icon(icon, color: active ? Colors.white : AppColors.textMuted, size: 16),
          SizedBox(width: 6),
          Text(label, style: GoogleFonts.cairo(color: active ? Colors.white : AppColors.textMuted, fontWeight: FontWeight.w700, fontSize: 13)),
        ]),
      ),
    );
  }
}
