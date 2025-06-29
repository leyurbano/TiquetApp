// src/features/products/NewProductModal.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { createProduct } from '../../services/productService';
import { CreateProduct } from './types';

interface NewProductModalProps {
  visible: boolean;
  onClose: () => void;
  onProductCreated: () => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  visible,
  onClose,
  onProductCreated,
}) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setId('');
    setName('');
    setPrice('');
    setStock('');
  };

  const validateForm = (): boolean => {
    // Validar ID si se proporciona
    if (id.trim()) {
      const idNum = parseInt(id);
      if (isNaN(idNum) || idNum <= 0) {
        Alert.alert('❌ Error', 'El ID debe ser un número entero mayor a 0');
        return false;
      }
    }

    if (!name.trim()) {
      Alert.alert('❌ Error', 'El nombre del producto es obligatorio');
      return false;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('❌ Error', 'El precio debe ser un número mayor a 0');
      return false;
    }

    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      Alert.alert('❌ Error', 'El stock debe ser un número mayor o igual a 0');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const productData: CreateProduct = {
        name: name.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
      };

      // Agregar ID solo si se proporcionó
      if (id.trim()) {
        productData.id = parseInt(id);
      }

      console.log('📝 Creando producto:', productData);

      const newProduct = await createProduct(productData);

      if (newProduct) {
        Alert.alert(
          '✅ ¡Éxito!',
          `El producto "${newProduct.name}" ha sido creado correctamente.`,
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                onClose();
                onProductCreated();
              },
            },
          ]
        );
      } else {
        Alert.alert('❌ Error', 'No se pudo crear el producto. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('💥 Error creando producto:', error);
      
      // Manejo específico de errores de duplicado de ID
      if (error instanceof Error && error.message.includes('duplicate key')) {
        Alert.alert('❌ Error', 'Ya existe un producto con este ID. Por favor, usa un ID diferente o déjalo vacío para auto-generar.');
      } else {
        Alert.alert('❌ Error', 'Ocurrió un error inesperado al crear el producto.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (id || name || price || stock) {
      Alert.alert(
        '⚠️ Confirmar',
        '¿Estás seguro de que quieres cerrar? Se perderán los datos ingresados.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Cerrar',
            style: 'destructive',
            onPress: () => {
              resetForm();
              onClose();
            },
          },
        ]
      );
    } else {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>➕ Nuevo Producto</Text>
          <Text style={styles.subtitle}>Completa los datos del producto</Text>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>🆔 ID del Producto (Opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 12345 (se auto-genera si se deja vacío)"
              value={id}
              onChangeText={setId}
              keyboardType="number-pad"
              returnKeyType="next"
            />
            <Text style={styles.helpText}>
              💡 Puedes usar tu propio código SKU o dejarlo vacío para auto-generar
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>📦 Nombre del Producto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Smartphone Samsung Galaxy"
              value={name}
              onChangeText={setName}
              maxLength={100}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>💰 Precio *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>📊 Stock *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={stock}
              onChangeText={setStock}
              keyboardType="number-pad"
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />
          </View>

          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              💡 Tip: Asegúrate de que el nombre sea descriptivo y el precio esté en la moneda local.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            title="❌ Cancelar"
            onPress={handleClose}
            variant="outline"
            size="large"
            style={styles.cancelButton}
          />
          <Button
            title={loading ? "⏳ Guardando..." : "✅ Guardar"}
            onPress={handleSave}
            variant="success"
            size="large"
            style={styles.saveButton}
            disabled={loading}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    flex: 1,
    padding: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  infoContainer: {
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
