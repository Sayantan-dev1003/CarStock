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
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { AppInput } from '../../../src/components/common/AppInput';
import { AppButton } from '../../../src/components/common/AppButton';
import { productsApi } from '../../../src/api/products.api';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import client from '../../../src/api/client';

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
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.imageSection}>
                <TouchableOpacity
                    style={styles.imagePlaceholder}
                    onPress={pickImage}
                    disabled={uploading}
                >
                    {uploading ? (
                        <LoadingSpinner />
                    ) : image ? (
                        <Image source={{ uri: image }} style={styles.productImage} />
                    ) : (
                        <View style={styles.placeholderContent}>
                            <MaterialCommunityIcons name="camera-plus-outline" size={40} color={Colors.grey400} />
                            <Text style={styles.placeholderText}>Add Product Image</Text>
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
                        <MaterialCommunityIcons name="close-circle" size={24} color={Colors.error} />
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
                            placeholder="e.g. MRF ZVTV 185/65 R15"
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
                            placeholder="e.g. MRF"
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
                    <View style={{ flex: 1, marginRight: Spacing.md }}>
                        <Controller
                            control={control}
                            name="sellingPrice"
                            rules={{ required: 'Price is required' }}
                            render={({ field: { onChange, value } }) => (
                                <AppInput
                                    label="Selling Price"
                                    placeholder="0.00"
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="numeric"
                                    leftIcon="currency-inr"
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
                <Text style={styles.sectionTitle}>Additional Details</Text>
                <Controller
                    control={control}
                    name="description"
                    render={({ field: { onChange, value } }) => (
                        <AppInput
                            label="Description"
                            placeholder="Describe the product..."
                            value={value}
                            onChangeText={onChange}
                            multiline
                            numberOfLines={4}
                            containerStyle={{ height: 120 }}
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.screenBg,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    imageSection: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
        position: 'relative',
    },
    imagePlaceholder: {
        width: 150,
        height: 150,
        borderRadius: BorderRadius.lg,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.grey200,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        ...Shadows.sm,
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
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey500,
        marginTop: Spacing.xs,
        fontWeight: Typography.fontWeights.medium,
    },
    removeImageBtn: {
        position: 'absolute',
        top: -10,
        right: '30%',
        backgroundColor: Colors.white,
        borderRadius: 12,
    },
    section: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        ...Shadows.sm,
    },
    sectionTitle: {
        fontSize: Typography.fontSizes.md,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: Spacing.lg,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: Typography.fontSizes.xs,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.grey600,
        marginBottom: Spacing.sm,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: Spacing.lg,
    },
    catChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.grey100,
        marginRight: Spacing.sm,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    catChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    catText: {
        fontSize: 12,
        color: Colors.grey600,
        fontWeight: Typography.fontWeights.medium,
    },
    catTextActive: {
        color: Colors.white,
        fontWeight: Typography.fontWeights.bold,
    },
    footer: {
        marginTop: Spacing.md,
        marginBottom: Spacing.xxl,
    },
});
