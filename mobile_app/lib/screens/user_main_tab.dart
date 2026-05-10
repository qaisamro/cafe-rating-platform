import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/screens/user_home.dart';
import 'package:mobile_app/screens/rewards_screen.dart';
import 'package:mobile_app/screens/qr_scanner.dart';
import 'package:mobile_app/services/auth_service.dart';
import 'package:mobile_app/screens/welcome_screen.dart';

class UserMainTab extends StatefulWidget {
  @override
  _UserMainTabState createState() => _UserMainTabState();
}

class _UserMainTabState extends State<UserMainTab> {
  int _currentIndex = 0;
  final _authService = AuthService();

  final List<Widget> _pages = [
    UserHome(),
    RewardsScreen(),
    QRScanner(),
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
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _NavItem(icon: Icons.home_rounded, label: 'الرئيسية', index: 0, current: _currentIndex, onTap: () => setState(() => _currentIndex = 0)),
                _NavItem(icon: Icons.stars_rounded, label: 'مكافآتي', index: 1, current: _currentIndex, onTap: () => setState(() => _currentIndex = 1)),
                _NavItem(icon: Icons.qr_code_scanner_rounded, label: 'QR', index: 2, current: _currentIndex, onTap: () => setState(() => _currentIndex = 2)),
                _NavItemIcon(icon: Icons.logout_rounded, label: 'خروج', onTap: _showLogoutConfirm, color: AppColors.danger),
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
        padding: EdgeInsets.symmetric(horizontal: active ? 18 : 14, vertical: 10),
        decoration: BoxDecoration(
          gradient: active ? AppColors.cardGradient : null,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Icon(icon, color: active ? Colors.white : AppColors.textMuted, size: 22),
            if (active) ...[SizedBox(width: 8), Text(label, style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14))],
          ],
        ),
      ),
    );
  }
}

class _NavItemIcon extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color color;
  _NavItemIcon({required this.icon, required this.label, required this.onTap, required this.color});
  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: onTap,
    child: Container(
      padding: EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      child: Icon(icon, color: color, size: 22),
    ),
  );
}
