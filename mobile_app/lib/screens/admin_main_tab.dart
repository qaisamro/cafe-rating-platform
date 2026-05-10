import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/screens/admin_home.dart';
import 'package:mobile_app/screens/admin_users_screen.dart';
import 'package:mobile_app/screens/admin_notifications_screen.dart';
import 'package:mobile_app/screens/admin_settings_screen.dart';
import 'package:mobile_app/screens/admin_moderation_screen.dart';
import 'package:mobile_app/services/auth_service.dart';
import 'package:mobile_app/screens/welcome_screen.dart';

class AdminMainTab extends StatefulWidget {
  @override
  _AdminMainTabState createState() => _AdminMainTabState();
}

class _AdminMainTabState extends State<AdminMainTab> {
  int _currentIndex = 0;
  final _authService = AuthService();

  final List<Widget> _pages = [
    AdminHome(),
    AdminUsersScreen(),
    AdminModerationScreen(),
    AdminNotificationsScreen(),
    AdminSettingsScreen(),
  ];

  void _showLogoutConfirm() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(children: [
          Container(padding: EdgeInsets.all(8), decoration: BoxDecoration(color: AppColors.danger.withOpacity(0.1), shape: BoxShape.circle), child: Icon(Icons.logout, color: AppColors.danger, size: 20)),
          SizedBox(width: 12),
          Text('تأكيد الخروج', style: GoogleFonts.cairo(fontWeight: FontWeight.w800)),
        ]),
        content: Text('هل تريد تسجيل الخروج؟', style: GoogleFonts.cairo(color: AppColors.textMuted)),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: Text('إلغاء', style: GoogleFonts.cairo())),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await _authService.logout();
              Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => WelcomeScreen()), (_) => false);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
            child: Text('خروج', style: GoogleFonts.cairo()),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(index: _currentIndex, children: _pages),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.08), blurRadius: 30, offset: Offset(0, -10))],
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _AdminNav(icon: Icons.dashboard_rounded, label: 'لوحة التحكم', index: 0, current: _currentIndex, onTap: () => setState(() => _currentIndex = 0)),
                _AdminNav(icon: Icons.people_alt_rounded, label: 'المستخدمون', index: 1, current: _currentIndex, onTap: () => setState(() => _currentIndex = 1)),
                _AdminNav(icon: Icons.rate_review_rounded, label: 'المراجعات', index: 2, current: _currentIndex, onTap: () => setState(() => _currentIndex = 2)),
                _AdminNav(icon: Icons.campaign_rounded, label: 'الإشعارات', index: 3, current: _currentIndex, onTap: () => setState(() => _currentIndex = 3)),
                _AdminNav(icon: Icons.settings_rounded, label: 'الإعدادات', index: 4, current: _currentIndex, onTap: () => setState(() => _currentIndex = 4)),
                GestureDetector(
                  onTap: _showLogoutConfirm,
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                    child: Icon(Icons.logout_rounded, color: AppColors.danger, size: 22),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _AdminNav extends StatelessWidget {
  final IconData icon;
  final String label;
  final int index, current;
  final VoidCallback onTap;
  _AdminNav({required this.icon, required this.label, required this.index, required this.current, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final active = index == current;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(horizontal: active ? 14 : 10, vertical: 8),
        decoration: BoxDecoration(
          gradient: active ? AppColors.caramelGradient : null,
          borderRadius: BorderRadius.circular(14),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: active ? Colors.white : AppColors.textMuted, size: 20),
            if (active) ...[
              SizedBox(height: 2),
              Text(label, style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 9)),
            ],
          ],
        ),
      ),
    );
  }
}
