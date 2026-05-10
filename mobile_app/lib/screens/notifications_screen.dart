import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';

class NotificationsScreen extends StatefulWidget {
  @override
  _NotificationsScreenState createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List _notifications = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  void _load() async {
    try {
      final res = await ApiService.get('/notifications/my');
      if (res.statusCode == 200 && mounted) {
        setState(() { _notifications = jsonDecode(res.body); _loading = false; });
      } else if (mounted) setState(() => _loading = false);
    } catch (_) { if (mounted) setState(() => _loading = false); }
    // Mark all as read
    ApiService.put('/notifications/read-all', {});
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
              gradient: AppColors.heroGradient,
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(30)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('الإشعارات 🔔', style: GoogleFonts.cairo(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
                  Text('${_notifications.length} إشعار', style: GoogleFonts.cairo(color: Colors.white70, fontSize: 13)),
                ]),
                IconButton(
                  icon: Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
                  onPressed: () => Navigator.pop(context),
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
                        Text('لا توجد إشعارات', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 18, fontWeight: FontWeight.w700)),
                      ]))
                    : RefreshIndicator(
                        onRefresh: () async => _load(),
                        color: AppColors.primary,
                        child: ListView.builder(
                          padding: EdgeInsets.all(16),
                          itemCount: _notifications.length,
                          itemBuilder: (_, i) {
                            final n = _notifications[i];
                            final isRead = n['is_read'] == true;
                            final typeData = _getTypeData(n['type'] ?? 'message');
                            return Container(
                              margin: EdgeInsets.only(bottom: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(18),
                                border: Border.all(color: isRead ? AppColors.border : AppColors.primary.withOpacity(0.3), width: isRead ? 1 : 1.5),
                                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: Offset(0, 4))],
                              ),
                              child: Padding(
                                padding: EdgeInsets.all(16),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      children: [
                                        Container(
                                          padding: EdgeInsets.all(10),
                                          decoration: BoxDecoration(
                                            gradient: isRead ? null : AppColors.caramelGradient,
                                            color: isRead ? AppColors.bg : null,
                                            borderRadius: BorderRadius.circular(12),
                                          ),
                                          child: Icon(typeData['icon'], color: isRead ? AppColors.textMuted : Colors.white, size: 20),
                                        ),
                                        SizedBox(width: 12),
                                        Expanded(child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(n['title'] ?? '', style: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.textPrimary)),
                                            Row(children: [
                                              Container(
                                                padding: EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(color: typeData['color'].withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                                                child: Text(typeData['label'], style: GoogleFonts.cairo(color: typeData['color'], fontSize: 10, fontWeight: FontWeight.w700)),
                                              ),
                                              if (!isRead) ...[
                                                SizedBox(width: 6),
                                                Container(width: 6, height: 6, decoration: BoxDecoration(color: AppColors.primary, shape: BoxShape.circle)),
                                              ],
                                            ]),
                                          ],
                                        )),
                                      ],
                                    ),
                                    if (n['message'] != null && (n['message'] as String).isNotEmpty) ...[
                                      SizedBox(height: 12),
                                      Container(
                                        padding: EdgeInsets.all(12),
                                        decoration: BoxDecoration(
                                          color: AppColors.bg,
                                          borderRadius: BorderRadius.circular(12),
                                          border: Border(right: BorderSide(color: AppColors.primary, width: 3)),
                                        ),
                                        child: Text(n['message'], style: GoogleFonts.cairo(color: AppColors.textSecondary, fontSize: 14, height: 1.6)),
                                      ),
                                    ],
                                    if (n['media_url'] != null && (n['media_url'] as String).isNotEmpty) ...[
                                      SizedBox(height: 10),
                                      if (n['type'] == 'image')
                                        ClipRRect(
                                          borderRadius: BorderRadius.circular(12),
                                          child: Image.network(n['media_url'], height: 180, width: double.infinity, fit: BoxFit.cover,
                                            errorBuilder: (_,__,___) => Container(height: 80, color: AppColors.bg, child: Center(child: Icon(Icons.broken_image, color: AppColors.border)))),
                                        )
                                      else
                                        GestureDetector(
                                          child: Container(
                                            padding: EdgeInsets.all(12),
                                            decoration: BoxDecoration(color: AppColors.primaryLight, borderRadius: BorderRadius.circular(12)),
                                            child: Row(children: [
                                              Icon(n['type'] == 'video' ? Icons.play_circle_rounded : Icons.open_in_new_rounded, color: AppColors.primary, size: 20),
                                              SizedBox(width: 8),
                                              Expanded(child: Text(n['media_url'], style: GoogleFonts.cairo(color: AppColors.primary, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                            ]),
                                          ),
                                        ),
                                    ],
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

  Map<String, dynamic> _getTypeData(String type) {
    switch (type) {
      case 'image': return {'icon': Icons.image_rounded, 'color': Color(0xFF4CAF50), 'label': 'صورة'};
      case 'video': return {'icon': Icons.videocam_rounded, 'color': Color(0xFFE91E63), 'label': 'فيديو'};
      case 'link': return {'icon': Icons.link_rounded, 'color': Color(0xFF2196F3), 'label': 'رابط'};
      default: return {'icon': Icons.campaign_rounded, 'color': AppColors.primary, 'label': 'رسالة'};
    }
  }
}
