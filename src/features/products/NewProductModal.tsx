// src/features/products/NewProductModal.tsx
import React, { useState, useEffect } from 'react';
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
  TouchableOpacity,
} from 'react-native';
import { Button } from '../../components/ui/Button';
import { createProduct, updateProduct } from '../../services/productService';
import { CreateProduct, Product } from './types';

interface NewProductModalProps {
  visible: boolean;
  onClose: () => void;
  onProductCreated: () => void;
  editingProduct?: Product | null; // Producto opcional para editar
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  visible,
  onClose,
  onProductCreated,
  editingProduct,
}) => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [addStock, setAddStock] = useState(''); // Campo para agregar/quitar stock
  const [stockMode, setStockMode] = useState<'add' | 'subtract'>('add'); // Modo: agregar o quitar
  const [loading, setLoading] = useState(false);

  // 🔄 Llenar campos cuando se está editando un producto
  useEffect(() => {
    if (editingProduct) {
      setId(editingProduct.id.toString());
      setName(editingProduct.name);
      setPrice(editingProduct.price.toString());
      setStock(editingProduct.stock.toString());
      setAddStock(''); // Limpiar campo de agregar/quitar stock
      setStockMode('add'); // Resetear a modo agregar
    } else {
      resetForm();
    }
  }, [editingProduct, visible]);

  const isEditing = !!editingProduct;

  const resetForm = () => {
    setId('');
    setName('');
    setPrice('');
    setStock('');
    setAddStock(''); // Limpiar campo de agregar/quitar stock
    setStockMode('add'); // Resetear a modo agregar
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

    // Validar campo addStock cuando se está editando
    if (isEditing && addStock.trim()) {
      const addStockNum = parseInt(addStock);
      if (isNaN(addStockNum) || addStockNum < 0) {
        Alert.alert('❌ Error', 'La cantidad debe ser un número mayor o igual a 0');
        return false;
      }

      // Validar que no se pueda quitar más stock del que hay
      if (stockMode === 'subtract') {
        const currentStock = parseInt(stock);
        if (addStockNum > currentStock) {
          Alert.alert('❌ Error', `No puedes quitar ${addStockNum} unidades. Solo hay ${currentStock} en stock.`);
          return false;
        }
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isEditing) {
        // ✏️ Actualizar producto existente
        const stockNum = parseInt(stock);
        const addStockNum = addStock.trim() ? parseInt(addStock) : 0;
        
        let finalStock;
        let operationText = '';
        
        if (addStockNum > 0) {
          if (stockMode === 'add') {
            finalStock = stockNum + addStockNum;
            operationText = `Stock actualizado: ${stockNum} + ${addStockNum} = ${finalStock} unidades`;
          } else {
            finalStock = stockNum - addStockNum;
            operationText = `Stock actualizado: ${stockNum} - ${addStockNum} = ${finalStock} unidades`;
          }
        } else {
          finalStock = stockNum;
          operationText = 'Producto actualizado correctamente (sin cambios en stock)';
        }

        const updateData = {
          name: name.trim(),
          price: parseFloat(price),
          stock: finalStock,
        };

        console.log('✏️ Actualizando producto:', updateData);
        console.log(`📦 Stock: ${stockNum} ${stockMode === 'add' ? '+' : '-'} ${addStockNum} = ${finalStock}`);

        const updatedProduct = await updateProduct(editingProduct!.id.toString(), updateData);

        if (updatedProduct) {
          Alert.alert(
            '✅ ¡Éxito!',
            `El producto "${updatedProduct.name}" ha sido actualizado.\n${operationText}`,
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
          Alert.alert('❌ Error', 'No se pudo actualizar el producto. Inténtalo de nuevo.');
        }
      } else {
        // ➕ Crear nuevo producto
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
      }
    } catch (error) {
      console.error('💥 Error guardando producto:', error);
      
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
          <Text style={styles.title}>
            {isEditing ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
          </Text>
          <Text style={styles.subtitle}>Completa los datos del producto</Text>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              🆔 ID del Producto {isEditing ? '' : '(Opcional)'}
            </Text>
            <TextInput
              style={[styles.input, isEditing && styles.disabledInput]}
              placeholder={isEditing 
                ? "ID asignado automáticamente" 
                : "Ej: 12345 (se auto-genera si se deja vacío)"
              }
              value={id}
              onChangeText={setId}
              keyboardType="number-pad"
              returnKeyType="next"
              editable={!isEditing}
            />
            <Text style={styles.helpText}>
              {isEditing 
                ? "💡 El ID no se puede modificar al editar" 
                : "💡 Puedes usar tu propio código SKU o dejarlo vacío para auto-generar"
              }
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
              style={[
                styles.input, 
                isEditing && styles.disabledInput // Stock bloqueado cuando se edita
              ]}
              placeholder="0"
              value={stock}
              onChangeText={setStock}
              keyboardType="number-pad"
              returnKeyType="next"
              onSubmitEditing={handleSave}
              editable={!isEditing} // Solo editable cuando se crea un producto nuevo
            />
            {isEditing && (
              <Text style={styles.disabledLabel}>
                💡 Stock actual (no editable)
              </Text>
            )}
          </View>

          {/* Campo adicional para agregar/quitar stock solo cuando se edita */}
          {isEditing && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>⚡ Modificar Stock</Text>
              
              {/* Botones para seleccionar modo */}
              <View style={styles.stockModeContainer}>
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    stockMode === 'add' && styles.modeButtonActive,
                    stockMode === 'add' && styles.addModeActive
                  ]}
                  onPress={() => setStockMode('add')}
                >
                  <Text style={[
                    styles.modeButtonText,
                    stockMode === 'add' && styles.modeButtonTextActive
                  ]}>
                    ➕ Agregar
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.modeButton,
                    stockMode === 'subtract' && styles.modeButtonActive,
                    stockMode === 'subtract' && styles.subtractModeActive
                  ]}
                  onPress={() => setStockMode('subtract')}
                >
                  <Text style={[
                    styles.modeButtonText,
                    stockMode === 'subtract' && styles.modeButtonTextActive
                  ]}>
                    ➖ Quitar
                  </Text>
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.input}
                placeholder={stockMode === 'add' ? "Cantidad a agregar" : "Cantidad a quitar"}
                value={addStock}
                onChangeText={setAddStock}
                keyboardType="number-pad"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <Text style={styles.helpText}>
                💡 {stockMode === 'add' 
                  ? 'Cantidad a agregar al stock actual' 
                  : 'Cantidad a quitar del stock actual'
                }
              </Text>
              {addStock && (
                <Text style={[
                  styles.stockPreviewText,
                  stockMode === 'subtract' && styles.stockPreviewSubtract
                ]}>
                  📦 Nuevo total: {stockMode === 'add' 
                    ? parseInt(stock) + (parseInt(addStock) || 0)
                    : parseInt(stock) - (parseInt(addStock) || 0)
                  }
                </Text>
              )}
            </View>
          )}

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
            title={loading 
              ? "⏳ Guardando..." 
              : isEditing 
                ? "✅ Actualizar" 
                : "✅ Crear"
            }
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
  disabledInput: {
    backgroundColor: '#f3f4f6',
    color: '#6b7280',
    borderColor: '#e5e7eb',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    fontStyle: 'italic',
  },
  disabledLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
    fontStyle: 'italic',
  },
  stockPreviewText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  stockPreviewSubtract: {
    color: '#dc2626', // Rojo para cuando se quita stock
  },
  // Nuevos estilos para los botones de modo
  stockModeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeButtonActive: {
    // Base para botón activo
  },
  addModeActive: {
    backgroundColor: '#059669', // Verde para agregar
  },
  subtractModeActive: {
    backgroundColor: '#dc2626', // Rojo para quitar
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#ffffff',
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
