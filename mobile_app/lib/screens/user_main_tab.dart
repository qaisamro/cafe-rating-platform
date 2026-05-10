import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/screens/user_home.dart';
import 'package:mobile_app/screens/rewards_screen.dart';
import 'package:mobile_app/screens/qr_scanner.dart';
import 'package:mobile_app/screens/profile_screen.dart';
import 'package:mobile_app/screens/notifications_screen.dart';
import 'package:mobile_app/services/auth_service.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/screens/welcome_screen.dart';

class UserMainTab extends StatefulWidget {
  @override
  _UserMainTabState createState() => _UserMainTabState();
}

class _UserMainTabState extends State<UserMainTab> {
  int _currentIndex = 0;
  int _unreadCount = 0;
  final _authService = AuthService();

  final List<Widget> _pages = [
    UserHome(),
    RewardsScreen(),
    QRScanner(),
    ProfileScreen(),
  ];

  @override
  void initState() { super.initState(); _loadUnreadCount(); }

  void _loadUnreadCount() async {
    try {
      final res = await ApiService.get('/notifications/unread-count');
      if (res.statusCode == 200 && mounted) {
        final data = jsonDecode(res.body);
        setState(() => _unreadCount = data['count'] ?? 0);
      }
    } catch (_) {}
  }

  void _goToNotifications() {
    Navigator.push(context, MaterialPageRoute(builder: (_) => NotificationsScreen())).then((_) {
      setState(() => _unreadCount = 0);
    });
  }

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
        content: Text('هل تريد تسجيل الخروج من الحساب؟', style: GoogleFonts.cairo(color: AppColors.textMuted)),
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
                _NavItem(icon: Icons.home_rounded, label: 'الرئيسية', index: 0, current: _currentIndex, onTap: () => setState(() => _currentIndex = 0)),
                _NavItem(icon: Icons.stars_rounded, label: 'مكافآتي', index: 1, current: _currentIndex, onTap: () => setState(() => _currentIndex = 1)),
                _NavItem(icon: Icons.qr_code_scanner_rounded, label: 'QR', index: 2, current: _currentIndex, onTap: () => setState(() => _currentIndex = 2)),
                _NavItem(icon: Icons.person_rounded, label: 'حسابي', index: 3, current: _currentIndex, onTap: () => setState(() => _currentIndex = 3)),
                // Notifications button
                GestureDetector(
                  onTap: _goToNotifications,
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                    child: Stack(
                      children: [
                        Icon(Icons.notifications_rounded, color: AppColors.textMuted, size: 24),
                        if (_unreadCount > 0) Positioned(
                          right: 0, top: 0,
                          child: Container(
                            width: 14, height: 14,
                            decoration: BoxDecoration(color: AppColors.danger, shape: BoxShape.circle),
                            child: Center(child: Text('$_unreadCount', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w900))),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
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

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int index, current;
  final VoidCallback onTap;
  _NavItem({required this.icon, required this.label, required this.index, required this.current, required this.onTap});
  @override
  Widget build(BuildContext context) {
    final active = index == current;
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(horizontal: active ? 14 : 10, vertical: 10),
        decoration: BoxDecoration(
          gradient: active ? AppColors.cardGradient : null,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(icon, color: active ? Colors.white : AppColors.textMuted, size: 22),
            if (active) ...[SizedBox(width: 6), Text(label, style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13))],
          ],
        ),
      ),
    );
  }
}
