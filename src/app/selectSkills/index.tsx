import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './SelectSkillsStyles';
import AppBackButton from '@/components/comman/AppHeader';
import { router } from 'expo-router';

const SelectSkillsScreen = ({ navigation }: any) => {
    const skills = [
        '#Skills',
        '#Lorem Ipsum',
        '#Best Skills',
        '#Best Skills',
        '#Skills',
        '#Lorem Ipsum',
        '#Skills',
        '#Lorem Ipsum',
        '#Best Skills',
    ];

    const [selectedIndexes, setSelectedIndexes] = useState<number[]>([
        0, 2, 5, 7,
    ]);

    const toggleSkill = (index: number) => {
        if (selectedIndexes.includes(index)) {
            setSelectedIndexes(selectedIndexes.filter(item => item !== index));
        } else {
            setSelectedIndexes([...selectedIndexes, index]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <AppBackButton />

                {/* Title */}
                <Text style={styles.title}>Select Skills</Text>

                <Text style={styles.subtitle}>
                    Lorem Ipsum has been the industry's
                </Text>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color="#888"
                        style={styles.searchIcon}
                    />

                    <TextInput
                        placeholder="Search the skills"
                        placeholderTextColor="#888"
                        style={styles.searchInput}
                    />
                </View>

                {/* Skills */}
                <View style={styles.skillsWrapper}>
                    {skills.map((skill, index) => {
                        const isSelected = selectedIndexes.includes(index);

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => toggleSkill(index)}
                                style={[
                                    styles.skillChip,
                                    isSelected && styles.selectedChip,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.skillText,
                                        isSelected && styles.selectedText,
                                    ]}
                                >
                                    {skill}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.footer}>
                    <Text style={styles.termsText}>
                        By "Create Account", you agree to the Terms of Use and Privacy
                        Policy.
                    </Text>

                    <TouchableOpacity
                        style={styles.continueButton}
                        onPress={() => router.push('/(tabs)/home')}
                    >
                        <Text style={styles.continueText}>Continue</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default SelectSkillsScreen;