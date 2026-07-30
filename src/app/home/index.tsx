import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, View } from 'react-native';;
import styles from './homeStyles';
import HomeHeader from '@/components/HomeHeader';
import HomeSearch from '@/components/HomeSearch';
import HomeBanner from '@/components/HomeBanner';
import HomeCoreStaff from '@/components/HomeCoreStaff';
import HomeWorkerCards from '@/components/HomeWorkerCards';
import HomePopularTrending from '@/components/HomePopularTrending';
import HomeBottomTab from '@/components/HomeBottomTab';
import CompletedJobs from '@/components/CompletedJobs';
import NearbyServices from '@/components/NearbyServices';
import PopularTrending from '@/components/PopularTrending';
import Footer from '@/components/Footer';

const HomeScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor="#1C2340" />
            <View style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <View style={styles.darkSection}>
                        <HomeHeader />
                        <HomeSearch />
                    </View>
                    <HomeBanner />
                    <View style={styles.lightSection}>
                        <HomeCoreStaff />
                        <CompletedJobs />
                        <NearbyServices />
                        <HomeWorkerCards />
                        <PopularTrending />
                        {/* <HomePopularTrending /> */}
                        <Footer />
                    </View>
                </ScrollView>
                {/* <HomeBottomTab /> */}
            </View>
        </SafeAreaView>
    );
};

export default HomeScreen;