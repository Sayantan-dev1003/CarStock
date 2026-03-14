import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../../src/constants/theme';
import { AppInput } from '../../../src/components/common/AppInput';
import { AppButton } from '../../../src/components/common/AppButton';
import { productsApi } from '../../../src/api/products.api';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import client from '../../../src/api/client';
import { AppHeader } from '../../../src/components/common/AppHeader';

const CATEGORIES = ['TYRES', 'BATTERIES', 'BRAKES', 'OILS', 'WIPERS', 'LIGHTING', 'AUDIO', 'OTHER'];

export default function AddEditProductScreen() {
    const { id } = useLocalSearchParams();
    const isEdit = !!id;
    const router = useRouter();
    const queryClient = useQueryClient();

    const [image, setImage] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const { data: product, isLoading: isFetching } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productsApi.getProduct(id as string),
        enabled: isEdit,
    });

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm({
        defaultValues: {
            sku: '',
            name: '',
            brand: '',
            category: 'OTHER',
            sellingPrice: '',
            reorderLevel: '5',
            description: '',
            imageUrl: '',
        },
    });

    const imageUrl = watch('imageUrl');

    useEffect(() => {
        if (product) {
            reset({
                sku: product.sku,
                name: product.name,
                brand: product.brand || '',
                category: product.category,
                sellingPrice: product.sellingPrice.toString(),
                reorderLevel: product.reorderLevel.toString(),
                description: product.description || '',
                imageUrl: product.imageUrl || '',
            });
            if (product.imageUrl) {
                setImage(product.imageUrl);
            }
        }
    }, [product]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            uploadImage(result.assets[0].uri);
        }
    };

    const uploadImage = async (uri: string) => {
        setUploading(true);
        try {
            const formData = new FormData();
            const fileName = uri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(fileName);
            const type = match ? `image/${match[1]}` : `image`;

            formData.append('image', {
                uri,
                name: fileName,
                type,
            } as any);

            const response = await client.post('/upload/product-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const uploadedUrl = response.data.url;
            setImage(uploadedUrl);
            setValue('imageUrl', uploadedUrl);
        } catch (error: any) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', error.response?.data?.message || 'Could not upload image');
        } finally {
            setUploading(false);
        }
    };

    const mutation = useMutation({
        mutationFn: (data: any) =>
            isEdit
                ? productsApi.updateProduct(id as string, data)
                : productsApi.createProduct(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            if (isEdit) queryClient.invalidateQueries({ queryKey: ['product', id] });
            Alert.alert('Success', `Product ${isEdit ? 'updated' : 'created'} successfully`);
            router.back();
        },
        onError: (error: any) => {
            Alert.alert('Error', error.response?.data?.message || 'Something went wrong');
        },
    });

    const onSubmit = (data: any) => {
        const payload = {
            ...data,
            sellingPrice: parseFloat(data.sellingPrice),
            reorderLevel: parseInt(data.reorderLevel, 10),
        };
        mutation.mutate(payload);
    };

    if (isEdit && isFetching) return <LoadingSpinner />;

    return (
        <View style={styles.container}>
            <AppHeader title={isEdit ? 'Edit Product' : 'Add New Product'} showBackButton />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.imageSection}>
                    <TouchableOpacity
                        style={styles.imagePlaceholder}
                        onPress={pickImage}
                        disabled={uploading}
                        activeOpacity={0.7}
                    >
                        {uploading ? (
                            <LoadingSpinner />
                        ) : image ? (
                            <Image source={{ uri: image }} style={styles.productImage} />
                        ) : (
                            <View style={styles.placeholderContent}>
                                <MaterialCommunityIcons name="camera-plus-outline" size={32} color={theme.colors.primary} />
                                <Text style={styles.placeholderText}>Choose Image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    {image && !uploading && (
                        <TouchableOpacity
                            style={styles.removeImageBtn}
                            onPress={() => {
                                setImage(null);
                                setValue('imageUrl', '');
                            }}
                        >
                            <MaterialCommunityIcons name="close-circle" size={24} color={theme.colors.error} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>

                    <Controller
                        control={control}
                        name="sku"
                        rules={{ required: 'SKU is required' }}
                        render={({ field: { onChange, value } }) => (
                            <AppInput
                                label="SKU / Item Code"
                                placeholder="e.g. TYRE-MRF-15"
                                value={value}
                                onChangeText={onChange}
                                error={errors.sku?.message}
                                autoCapitalize="characters"
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="name"
                        rules={{ required: 'Product Name is required' }}
                        render={({ field: { onChange, value } }) => (
                            <AppInput
                                label="Product Name"
                                placeholder="name of the part"
                                value={value}
                                onChangeText={onChange}
                                error={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="brand"
                        render={({ field: { onChange, value } }) => (
                            <AppInput
                                label="Brand (Optional)"
                                placeholder="manufacturer brand"
                                value={value}
                                onChangeText={onChange}
                            />
                        )}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Inventory & Pricing</Text>

                    <Text style={styles.label}>Category</Text>
                    <View style={styles.categoryContainer}>
                        {CATEGORIES.map((cat) => (
                            <Controller
                                key={cat}
                                control={control}
                                name="category"
                                render={({ field: { onChange, value } }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.catChip,
                                            value === cat && styles.catChipActive,
                                        ]}
                                        onPress={() => onChange(cat)}
                                        activeOpacity={0.8}
                                    >
                                        <Text style={[
                                            styles.catText,
                                            value === cat && styles.catTextActive
                                        ]}>{cat}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        ))}
                    </View>

                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                            <Controller
                                control={control}
                                name="sellingPrice"
                                rules={{ required: 'Price is required' }}
                                render={({ field: { onChange, value } }) => (
                                    <AppInput
                                        label="Price (₹)"
                                        placeholder="0.00"
                                        value={value}
                                        onChangeText={onChange}
                                        keyboardType="numeric"
                                        error={errors.sellingPrice?.message}
                                    />
                                )}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Controller
                                control={control}
                                name="reorderLevel"
                                rules={{ required: 'Required' }}
                                render={({ field: { onChange, value } }) => (
                                    <AppInput
                                        label="Reorder Level"
                                        placeholder="5"
                                        value={value}
                                        onChangeText={onChange}
                                        keyboardType="numeric"
                                        error={errors.reorderLevel?.message}
                                    />
                                )}
                            />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Additional Notes</Text>
                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, value } }) => (
                            <AppInput
                                label="Description"
                                placeholder="internal notes or details..."
                                value={value}
                                onChangeText={onChange}
                                multiline
                                numberOfLines={4}
                                containerStyle={{ height: 100 }}
                            />
                        )}
                    />
                </View>

                <View style={styles.footer}>
                    <AppButton
                        title={isEdit ? 'Update Product' : 'Create Product'}
                        onPress={handleSubmit(onSubmit)}
                        loading={mutation.isPending}
                        fullWidth
                        size="lg"
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bg,
    },
    scrollContent: {
        padding: 20,
    },
    imageSection: {
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    imagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 24,
        backgroundColor: theme.colors.bgCard,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        ...theme.shadow.sm,
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderContent: {
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 12,
        fontFamily: theme.font.bodyMedium,
        color: theme.colors.textSecondary,
        marginTop: 8,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -8,
        right: '32%',
        backgroundColor: theme.colors.bgCard,
        borderRadius: 12,
    },
    section: {
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.lg,
        padding: 24,
        marginBottom: 24,
        ...theme.shadow.sm,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: theme.font.bodyBold,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 12,
        fontFamily: theme.font.bodyBold,
        color: theme.colors.textSecondary,
        marginBottom: 8,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 20,
    },
    catChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: theme.radius.full,
        backgroundColor: theme.colors.bgMuted,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    catChipActive: {
        backgroundColor: theme.colors.primaryLight,
        borderColor: theme.colors.primary,
    },
    catText: {
        fontSize: 12,
        color: theme.colors.textSecondary,
        fontFamily: theme.font.bodyMedium,
    },
    catTextActive: {
        color: theme.colors.primary,
        fontFamily: theme.font.bodyBold,
    },
    footer: {
        marginTop: 8,
        marginBottom: 48,
    },
});
