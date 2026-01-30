import React from "react";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { colors } from "../utils/theme";

export default function DrawerContent(props: DrawerContentComponentProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.newBtn} onPress={() => props.navigation.closeDrawer()}>
          <Text style={styles.newBtnTxt}>＋ New Calendar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionTitle}><Text style={styles.sectionTxt}>MY CALENDARS</Text></View>

      <ScrollView contentContainerStyle={{ paddingBottom: 18 }}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Sidebar (Drawer)</Text>
          <Text style={styles.placeholderBody}>
            RN에서는 Drawer가 Sidebar 역할을 합니다.{"\n"}
            캘린더/공유 UI는 Calendar 화면의 상단 가로 스트립에서 제공합니다.
          </Text>
        </View>

        <TouchableOpacity style={styles.navBtn} onPress={() => props.navigation.closeDrawer()}>
          <Text style={styles.navBtnTxt}>Back to Calendar</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{flex:1,backgroundColor:colors.bg,borderRightWidth:1,borderRightColor:colors.border},
  header:{padding:16,borderBottomWidth:1,borderBottomColor:colors.border},
  newBtn:{backgroundColor:colors.dark,borderRadius:12,paddingVertical:10,alignItems:"center"},
  newBtnTxt:{color:"#fff",fontWeight:"800"},
  sectionTitle:{paddingHorizontal:16,paddingTop:14,paddingBottom:8},
  sectionTxt:{color:colors.muted,fontWeight:"800",fontSize:12},
  placeholder:{margin:16,borderWidth:1,borderColor:colors.border,borderRadius:16,padding:14,backgroundColor:colors.soft},
  placeholderTitle:{fontWeight:"800",color:colors.text},
  placeholderBody:{marginTop:6,color:colors.muted,fontSize:13,lineHeight:18},
  navBtn:{marginHorizontal:16,borderWidth:1,borderColor:colors.border,borderRadius:12,paddingVertical:10,alignItems:"center"},
  navBtnTxt:{fontWeight:"700",color:colors.text},
});
