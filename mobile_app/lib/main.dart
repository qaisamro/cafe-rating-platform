import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/screens/welcome_screen.dart';
import 'package:mobile_app/screens/user_main_tab.dart';
import 'package:mobile_app/screens/owner_main_tab.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('token');
  final role = prefs.getString('role');
  runApp(CafeApp(initialToken: token, initialRole: role));
}

// ============================================
// PREMIUM DESIGN SYSTEM — كافيه كونكت 2026
// ============================================
class AppColors {
  // === ☕ Brand — Coffee Palette ===
  static const primary = Color(0xFFC8763A);       // Caramel
  static const primaryLight = Color(0xFFFAF0E0);  // Cream Light
  static const primaryDark = Color(0xFF9A5520);   // Deep Caramel
  static const secondary = Color(0xFF6B3A2A);     // Coffee Brown
  static const accent = Color(0xFFE8A838);        // Amber Gold
  static const accentLight = Color(0xFFFEF3DC);   // Amber Glow
  static const reward = Color(0xFF3D9B7A);        // Mint Emerald
  static const rewardLight = Color(0xFFE0F5EE);   // Mint Bloom

  // === Semantic ===
  static const success = Color(0xFF2C7A5A);
  static const warning = Color(0xFFB8720A);
  static const danger = Color(0xFFB83232);

  // === ☕ Light Mode Surfaces ===
  static const bg = Color(0xFFFAF3E0);            // Warm Cream
  static const surface = Color(0xFFFFFFFF);
  static const surfaceAlt = Color(0xFFFEF9F0);    // Milk White

  // === Typography ===
  static const textPrimary = Color(0xFF1C0F0A);   // Espresso Black
  static const textSecondary = Color(0xFF5C3D2A); // Dark Walnut
  static const textMuted = Color(0xFF9E8070);     // Taupe
  static const border = Color(0xFFE8D9C6);        // Walnut Edge

  // === 🌟 Gradients ===
  static const Gradient heroGradient = LinearGradient(
    colors: [Color(0xFF2C1810), Color(0xFF6B3A2A), Color(0xFFC8763A)],
    begin: Alignment.topRight,
    end: Alignment.bottomLeft,
  );

  static const Gradient caramelGradient = LinearGradient(
    colors: [Color(0xFFC8763A), Color(0xFFE8A838)],
    begin: Alignment.topRight,
    end: Alignment.bottomLeft,
  );

  static const Gradient rewardGradient = LinearGradient(
    colors: [Color(0xFF3D9B7A), Color(0xFF6BCAAA)],
    begin: Alignment.topRight,
    end: Alignment.bottomLeft,
  );

  // Legacy alias so existing screens don't break
  static const Gradient cardGradient = LinearGradient(
    colors: [Color(0xFFC8763A), Color(0xFFE8A838)],
    begin: Alignment.topRight,
    end: Alignment.bottomLeft,
  );
}

class CafeApp extends StatelessWidget {
  final String? initialToken;
  final String? initialRole;
  CafeApp({this.initialToken, this.initialRole});

  @override
  Widget build(BuildContext context) {
    Widget home = WelcomeScreen();
    if (initialToken != null && initialToken!.isNotEmpty) {
      home = initialRole == 'owner' ? OwnerMainTab() : UserMainTab();
    }

    return MaterialApp(
      title: 'كافيه كونكت',
      debugShowCheckedModeBanner: false,
      locale: Locale('ar'),
      supportedLocales: [Locale('ar')],
      localizationsDelegates: [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          secondary: AppColors.secondary,
        ),
        textTheme: GoogleFonts.cairoTextTheme().apply(
          bodyColor: AppColors.textPrimary,
          displayColor: AppColors.textPrimary,
        ),
        scaffoldBackgroundColor: AppColors.bg,
        appBarTheme: AppBarTheme(
          backgroundColor: AppColors.surface,
          elevation: 0,
          scrolledUnderElevation: 0,
          centerTitle: true,
          titleTextStyle: GoogleFonts.cairo(
            color: AppColors.textPrimary,
            fontSize: 19,
            fontWeight: FontWeight.w800,
          ),
          iconTheme: IconThemeData(color: AppColors.textPrimary),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            textStyle: GoogleFonts.cairo(fontWeight: FontWeight.w700, fontSize: 16),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.surface,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: AppColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: AppColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(color: AppColors.primary, width: 2),
          ),
          contentPadding: EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        ),
        cardTheme: CardTheme(
          color: AppColors.surface,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: BorderSide(color: AppColors.border, width: 1),
          ),
        ),
      ),
      home: home,
    );
  }
}