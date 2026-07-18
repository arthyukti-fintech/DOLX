import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Image,
    StatusBar,
} from 'react-native';
import styles from './eventPlannerStyles';
import AppBackButton from '@/components/comman/AppHeader';
import { router } from 'expo-router';

const EventPlannerScreen = ({ navigation }: any) => {
    return (
        <SafeAreaView style={styles.safe}>
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Section */}
                <View style={styles.heroContainer}>

                    {/* Background Image */}
                    <Image
                        source={require('../../../assets/images/Rectangle 22.png')}
                        style={styles.bgImage}
                        resizeMode="cover"
                        blurRadius={2}
                    />

                    {/* Dark Overlay */}
                    <View style={styles.overlay} />

                    {/* Back Button */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.backArrow}>←</Text>
                    </TouchableOpacity>

                    {/* Favourite Button */}
                    {/* <TouchableOpacity
                        style={styles.favoriteButton}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={require('../../../assets/images/Rectangle 22.png')}
                            style={styles.favoriteIcon}
                        />
                    </TouchableOpacity> */}

                    {/* <AppBackButton style={{ marginTop: -100 }} /> */}

                    {/* Foreground Image */}
                    <View style={styles.foregroundWrapper}>
                        <Image
                            source={require('../../../assets/images/Rectangle 22.png')}
                            style={styles.foregroundImage}
                            resizeMode="cover"
                        />
                    </View>
                </View>

                {/* Content */}
                <View style={styles.contentContainer}>

                    <Text style={styles.title}>
                        Event Planner
                    </Text>

                    <Text style={styles.shortDescription}>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry.
                    </Text>

                    <Text style={styles.description}>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industry's
                        standard dummy text ever since the 1960s. It has survived
                        not only five centuries, but also the leap into electronic
                        typesetting, remaining essentially unchanged.
                    </Text>

                    <View style={styles.divider} />

                    <Text style={styles.serviceCost}>
                        Service Cost
                    </Text>

                    <View style={styles.priceRow}>
                        <Text style={styles.price}>
                            ₹5,867
                        </Text>

                        <Text style={styles.perEvent}>
                            / Per Event
                        </Text>
                    </View>

                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.bookButton}
                    activeOpacity={0.9}
                    onPress={() => { router.push("/bookingBasicInfo") }}
                >
                    <Text style={styles.bookButtonText}>
                        Book Now
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default EventPlannerScreen;