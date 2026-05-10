import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_app/services/api_service.dart';

class CafeDetail extends StatefulWidget {
  final int cafeId;
  CafeDetail({required this.cafeId});

  @override
  _CafeDetailState createState() => _CafeDetailState();
}

class _CafeDetailState extends State<CafeDetail> {
  Map? _cafe;
  List _products = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCafeDetail();
  }

  void _loadCafeDetail() async {
    try {
      final res = await ApiService.get('/cafes/${widget.cafeId}');
      final prodRes = await ApiService.get('/products/cafe/${widget.cafeId}');
      setState(() {
        _cafe = jsonDecode(res.body);
        _products = jsonDecode(prodRes.body);
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFFDF8F5),
      appBar: AppBar(
        title: Text(_cafe?['name'] ?? 'Café Details', style: TextStyle(color: Colors.brown[900], fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
        foregroundColor: Colors.brown[900],
      ),
      body: _isLoading 
        ? Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (_cafe?['image_url'] != null && _cafe?['image_url'] != '')
                  Image.network(_cafe?['image_url'], width: double.infinity, height: 200, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Container(height: 200, color: Colors.brown[50])),
                Padding(
                  padding: EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_cafe!['name'], style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.brown[900])),
                      SizedBox(height: 8),
                      Row(
                        children: [
                          Icon(Icons.location_on_outlined, size: 16, color: Colors.brown[400]),
                          SizedBox(width: 4),
                          Text(_cafe!['address'] ?? 'No address', style: TextStyle(color: Colors.grey[600])),
                        ],
                      ),
                      SizedBox(height: 24),
                      Text('Menu Items', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.brown[900])),
                      SizedBox(height: 16),
                      ..._products.map((p) => Container(
                        margin: EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(15),
                          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)],
                        ),
                        child: ListTile(
                          leading: ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: p['image_url'] != null && p['image_url'] != ''
                              ? Image.network(p['image_url'], width: 55, height: 55, fit: BoxFit.cover, errorBuilder: (_, __, ___) => Icon(Icons.coffee, color: Colors.brown))
                              : Icon(Icons.coffee, color: Colors.brown),
                          ),
                          title: Text(p['name'], style: TextStyle(fontWeight: FontWeight.bold)),
                          subtitle: Text(p['description'] ?? 'Delicious product'),
                          trailing: Text('\$${p['price'] ?? '0.0'}', style: TextStyle(color: Colors.brown[700], fontWeight: FontWeight.bold)),
                        ),
                      )).toList(),
                      if (_products.isEmpty)
                        Padding(
                          padding: EdgeInsets.symmetric(vertical: 20),
                          child: Center(child: Text('No products available yet.', style: TextStyle(color: Colors.grey))),
                        ),
                      SizedBox(height: 32),
                      Center(
                        child: ElevatedButton(
                          onPressed: _showReviewDialog,
                          child: Text('RATE & REVIEW'),
                          style: ElevatedButton.styleFrom(
                            minimumSize: Size(double.infinity, 55),
                            backgroundColor: Colors.brown[700],
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
    );
  }

  void _showReviewDialog() async {
    final token = await ApiService.getToken();
    if (token == null || token.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Please login to rate cafés'),
          behavior: SnackBarBehavior.floating,
          action: SnackBarAction(label: 'LOGIN', onPressed: () => Navigator.popUntil(context, (route) => route.isFirst)),
        ),
      );
      return;
    }
    // Implement real review dialog later...
  }
}
