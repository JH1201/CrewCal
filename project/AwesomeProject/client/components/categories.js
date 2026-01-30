import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React from 'react'
import { categories } from '../constants/index';

export default function Categories() {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
                contentContainerStyle={{
                    paddingHorizontal: 15,
                }}
            >
                {
                    categories.map((category, index) => {
                        return (
                            <View key={index} style={styles.categoryContainer}>
                                <TouchableOpacity
                                    style={styles.categoryButton}>
                                    <Image style={styles.categoryImage}
                                        source={category.image} />
                                    <Text className="text-sm">{category.name}</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    })
                }
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginTop: 7,
    },
    scrollView: {
        overflow: 'visible',
    },
    categoryContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    categoryButton: {
        padding: 5,
        borderRadius: 80,
        shadowColor: 'black',
        shadowOpacity: 0.5,
        shadowOffset: { width: 1, height: 2 },
        backgroundColor: '#E2E2E2',
    },
    categoryImage: {
        width: 45,
        height: 45,
    },
});
