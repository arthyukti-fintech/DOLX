import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native';
import { router } from 'expo-router';

import styles from './basicInfoStyles';
import AppBackButton from '@/components/comman/AppHeader';

const BasicInfoScreen = () => {
    const [eventTitle, setEventTitle] = useState('');
    const [category, setCategory] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [eventHours, setEventHours] = useState('');
    const [people, setPeople] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    return (
        <SafeAreaView style={styles.container} >

            {/* Header */}
            <View style={styles.header}>
                <AppBackButton />

                <Text style={styles.headerTitle}>
                    Basic Info
                </Text>

                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContainer}
            >

                {/* Event Title */}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        Event Title
                    </Text>

                    <TextInput
                        value={eventTitle}
                        onChangeText={setEventTitle}
                        placeholder="Eg: Tech Conference 2026"
                        placeholderTextColor="#B7B7B7"
                        style={styles.input}
                    />
                </View>

                {/* Event Category */}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        Event Category
                    </Text>

                    <TouchableOpacity style={styles.dropdown}>
                        <Text
                            style={[
                                styles.dropdownText,
                                !category && styles.placeholder,
                            ]}
                        >
                            {category || 'Select Category'}
                        </Text>

                        {/* <Image
                            source={require('../../../assets/Icons/chevron-down.png')}
                            style={styles.dropdownIcon}
                        /> */}
                    </TouchableOpacity>
                </View>

                {/* Event Date */}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        Event Date
                    </Text>

                    <TouchableOpacity style={styles.dropdown}>
                        <Text
                            style={[
                                styles.dropdownText,
                                !eventDate && styles.placeholder,
                            ]}
                        >
                            {eventDate || 'Select the date'}
                        </Text>

                        {/* <Image
                            source={require('../../../assets/Icons/calendar.png')}
                            style={styles.dropdownIcon}
                        /> */}
                    </TouchableOpacity>
                </View>

                {/* Event Time */}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        Event Time
                    </Text>

                    <TouchableOpacity style={styles.dropdown}>
                        <Text
                            style={[
                                styles.dropdownText,
                                !eventTime && styles.placeholder,
                            ]}
                        >
                            {eventTime || 'Select the time'}
                        </Text>

                        {/* <Image
                            source={require('../../../assets/Icons/clock.png')}
                            style={styles.dropdownIcon}
                        /> */}
                    </TouchableOpacity>
                </View>

                {/* Event Hours */}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        Event Hours
                    </Text>

                    <TouchableOpacity style={styles.dropdown}>
                        <Text
                            style={[
                                styles.dropdownText,
                                !eventHours && styles.placeholder,
                            ]}
                        >
                            {eventHours || 'Select Hours'}
                        </Text>

                        {/* <Image
                            source={require('../../../assets/Icons/chevron-down.png')}
                            style={styles.dropdownIcon}
                        /> */}
                    </TouchableOpacity>
                </View>

                {/* No Of Peoples */}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        No Of Peoples
                    </Text>

                    <TouchableOpacity style={styles.dropdown}>
                        <Text
                            style={[
                                styles.dropdownText,
                                !people && styles.placeholder,
                            ]}
                        >
                            {people || 'Select Peoples'}
                        </Text>

                        {/* <Image
                            source={require('../../../assets/Icons/chevron-down.png')}
                            style={styles.dropdownIcon}
                        /> */}
                    </TouchableOpacity>
                </View>

                {/* Event Location */}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        Event Location
                    </Text>

                    <TextInput
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Enter Event Location"
                        placeholderTextColor="#B7B7B7"
                        style={styles.input}
                    />
                </View>

                {/* Description */}

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        Event Description
                    </Text>

                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Tell us about the event..."
                        placeholderTextColor="#B7B7B7"
                        multiline
                        textAlignVertical="top"
                        style={styles.descriptionInput}
                    />
                </View>

            </ScrollView>

            {/* Continue Button */}

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.continueButton}
                    activeOpacity={0.85}
                    onPress={() => router.push('/selectSkills')}
                >
                    <Text style={styles.continueText}>
                        Continue
                    </Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
};

export default BasicInfoScreen;