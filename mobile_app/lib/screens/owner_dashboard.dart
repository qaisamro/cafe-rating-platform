import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/screens/owner_wheel_management.dart';

class OwnerDashboard extends StatefulWidget {
  @override
  _OwnerDashboardState createState() => _OwnerDashboardState();
}

class _OwnerDashboardState extends State<OwnerDashboard> {
  bool _isLoading = true;
  Map? _cafe;
  int _totalProducts = 0;
  int _totalReviews = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() async {
    try {
      final response = await ApiService.get('/cafes/my-cafe');
      if (response.statusCode == 200) {
        _cafe = jsonDecode(response.body);
        final prodRes = await ApiService.get('/products/cafe/${_cafe!['id']}');
        final revRes = await ApiService.get('/reviews/cafe/${_cafe!['id']}');
        setState(() {
          _totalProducts = jsonDecode(prodRes.body).length;
          _totalReviews = jsonDecode(revRes.body).length;
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFFDFBF7),
      appBar: AppBar(
        title: Text('مركز الأعمال', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: _isLoading 
        ? Center(child: CircularProgressIndicator(color: Color(0xFFD4A373))) 
        : _cafe == null 
          ? _buildNoCafeState()
          : Padding(
              padding: EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('مرحباً، ${_cafe!['name']}', 
                    style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF2B2D42))
                  ),
                  SizedBox(height: 24),
                  Row(
                    children: [
                      _buildStatCard('المنتجات', _totalProducts.toString(), Icons.shopping_bag_outlined, Color(0xFF3A5A40)),
                      SizedBox(width: 16),
                      _buildStatCard('التقييمات', _totalReviews.toString(), Icons.star_outline, Color(0xFFD4A373)),
                    ],
                  ),
                  SizedBox(height: 32),
                  Text('إدارة المكافآت والعروض', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  SizedBox(height: 16),
                  GestureDetector(
                    onTap: () {
                      Navigator.push(context, MaterialPageRoute(builder: (_) => OwnerWheelManagementScreen()));
                    },
                    child: Container(
                      padding: EdgeInsets.all(20),
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: Colors.grey[200]!)
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: EdgeInsets.all(12),
                            decoration: BoxDecoration(color: Color(0xFFD4A373).withOpacity(0.1), shape: BoxShape.circle),
                            child: Icon(Icons.casino_outlined, color: Color(0xFFD4A373), size: 28),
                          ),
                          SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('إدارة دولاب الحظ', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2B2D42))),
                                SizedBox(height: 4),
                                Text('حدد جوائز ونسب فوز دولاب الحظ للزبائن', style: TextStyle(color: Colors.grey[500], fontWeight: FontWeight.w500)),
                              ],
                            ),
                          ),
                          Icon(Icons.arrow_forward_ios, color: Colors.grey[400], size: 18),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildNoCafeState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.storefront_outlined, size: 100, color: Colors.grey[300]),
            SizedBox(height: 24),
            Text('لا يوجد مقهى مسجل', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            SizedBox(height: 12),
            Text('انتقل إلى تبويب "مقهاتي" لإعداد ملفك الشخصي والبدء.', 
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey[600], fontSize: 16)
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.symmetric(vertical: 24, horizontal: 16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 20, offset: Offset(0, 8))],
        ),
        child: Column(
          children: [
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 28),
            ),
            SizedBox(height: 16),
            Text(value, style: TextStyle(fontSize: 30, fontWeight: FontWeight.bold, color: Color(0xFF2B2D42))),
            SizedBox(height: 4),
            Text(label, style: TextStyle(color: Colors.grey[500], fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
