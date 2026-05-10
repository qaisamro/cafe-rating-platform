import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:google_fonts/google_fonts.dart';

class OwnerWheelManagementScreen extends StatefulWidget {
  @override
  _OwnerWheelManagementScreenState createState() => _OwnerWheelManagementScreenState();
}

class _OwnerWheelManagementScreenState extends State<OwnerWheelManagementScreen> {
  List _rewards = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadRewards();
  }

  void _loadRewards() async {
    try {
      final res = await ApiService.get('/gamification/owner/rewards');
      if (res.statusCode == 200) {
        setState(() {
          _rewards = jsonDecode(res.body);
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _deleteReward(int id) async {
    await ApiService.delete('/gamification/owner/rewards/$id');
    _loadRewards();
  }

  void _showAddDialog() {
    TextEditingController valueController = TextEditingController();
    TextEditingController probController = TextEditingController();
    String type = 'points';
    
    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: Text('إضافة جائزة لدولاب الحظ', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    DropdownButtonFormField<String>(
                      value: type,
                      items: [
                        DropdownMenuItem(value: 'points', child: Text('نقاط')),
                        DropdownMenuItem(value: 'coupon', child: Text('كوبون / خصم')),
                        DropdownMenuItem(value: 'item', child: Text('منتج مجاني')),
                      ],
                      onChanged: (val) => setStateDialog(() => type = val!),
                      decoration: InputDecoration(
                        labelText: 'نوع الجائزة',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                    SizedBox(height: 16),
                    TextField(
                      controller: valueController,
                      decoration: InputDecoration(
                        labelText: 'قيمة الجائزة (مثلا: 50 للمنقاط، كوبون 10%، مشروب قهوة)',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                    SizedBox(height: 16),
                    TextField(
                      controller: probController,
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'نسبة الفوز (%) - من 1 إلى 100',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context), child: Text('إلغاء')),
                ElevatedButton(
                  onPressed: () async {
                    try {
                      await ApiService.post('/gamification/owner/rewards', {
                        'reward_type': type,
                        'value': valueController.text,
                        'probability': double.tryParse(probController.text) ?? 10.0,
                        'image_url': '',
                        'active': true
                      });
                      Navigator.pop(context);
                      setState(() => _isLoading = true);
                      _loadRewards();
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('حدث خطأ!')));
                    }
                  },
                  child: Text('حفظ'),
                ),
              ],
            );
          }
        );
      }
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('إدارة دولاب الحظ', style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : _rewards.isEmpty
              ? Center(child: Text('لا توجد جوائز في دولاب الحظ الخاص بك.', style: GoogleFonts.cairo(fontSize: 18)))
              : ListView.builder(
                  padding: EdgeInsets.all(16),
                  itemCount: _rewards.length,
                  itemBuilder: (context, index) {
                    final reward = _rewards[index];
                    return Card(
                      color: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: AppColors.heroGradient.colors.first.withOpacity(0.1),
                          child: Icon(
                            reward['reward_type'] == 'points' ? Icons.stars : Icons.card_giftcard,
                            color: AppColors.heroGradient.colors.first
                          ),
                        ),
                        title: Text(reward['value'] + (reward['reward_type'] == 'points' ? ' نقطة' : ''), style: GoogleFonts.cairo(fontWeight: FontWeight.bold)),
                        subtitle: Text('النسبة: ${reward['probability']}%'),
                        trailing: IconButton(
                          icon: Icon(Icons.delete, color: AppColors.danger),
                          onPressed: () => _deleteReward(reward['id']),
                        ),
                      ),
                    );
                  },
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddDialog,
        backgroundColor: AppColors.primary,
        icon: Icon(Icons.add, color: Colors.white),
        label: Text('إضافة جائزة', style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
