import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/screens/owner_home.dart';
import 'package:mobile_app/screens/my_cafe_screen.dart';
import 'package:mobile_app/screens/manage_products_screen.dart';
import 'package:mobile_app/services/auth_service.dart';
import 'package:mobile_app/screens/welcome_screen.dart';

class OwnerMainTab extends StatefulWidget {
  @override
  _OwnerMainTabState createState() => _OwnerMainTabState();
}

class _OwnerMainTabState extends State<OwnerMainTab> {
  int _currentIndex = 0;
  final _authService = AuthService();

  final List<Widget> _pages = [OwnerHome(), ManageProductsScreen(), MyCafeScreen()];
  final List<String> _titles = ['مركز الأعمال', 'إدارة المنيو', 'ملف المقهى'];

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
        content: Text('هل تريد تسجيل الخروج من حسابك؟', style: GoogleFonts.cairo(color: AppColors.textMuted)),
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
      appBar: AppBar(
        title: Text(_titles[_currentIndex]),
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: Container(
              padding: EdgeInsets.all(8),
              decoration: BoxDecoration(color: AppColors.danger.withOpacity(0.08), shape: BoxShape.circle),
              child: Icon(Icons.logout, color: AppColors.danger, size: 20),
            ),
            onPressed: _showLogoutConfirm,
          ),
          SizedBox(width: 8),
        ],
      ),
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
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _OwnerNavItem(icon: Icons.dashboard_rounded, label: 'الرئيسية', index: 0, current: _currentIndex, onTap: () => setState(() => _currentIndex = 0)),
                _OwnerNavItem(icon: Icons.restaurant_menu_rounded, label: 'المنيو', index: 1, current: _currentIndex, onTap: () => setState(() => _currentIndex = 1)),
                _OwnerNavItem(icon: Icons.store_rounded, label: 'ملف المقهى', index: 2, current: _currentIndex, onTap: () => setState(() => _currentIndex = 2)),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _OwnerNavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final int index, current;
  final VoidCallback onTap;
  _OwnerNavItem({required this.icon, required this.label, required this.index, required this.current, required this.onTap});
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
        child: Row(children: [
          Icon(icon, color: active ? Colors.white : AppColors.textMuted, size: 22),
          if (active) ...[SizedBox(width: 8), Text(label, style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14))],
        ]),
      ),
    );
  }
}
