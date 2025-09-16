/**
 * CreateCategoryModal Component
 * Modal component for creating new categories using the new Modal structure
 */

import { useState, FormEvent } from 'react';
import { createCategory, validateCategoryData } from '../services/category.service';
import { CreateCategoryData, CategoryFormErrors } from '@/types/category.types';
import { Modal, Button, Input, Textarea, ColorInput, Checkbox } from '@/components/ui';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onCategoryCreated?: () => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onCategoryCreated,
}) => {
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    description: '',
    color: '#3B82F6',
    is_active: true,
  });

  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof CategoryFormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    setApiError('');
  };

  const validateForm = (): boolean => {
    const validationErrors = validateCategoryData(formData);
    const errorMap: CategoryFormErrors = {};

    validationErrors.forEach((error) => {
      if (error.includes('name')) {
        errorMap.name = error;
      } else if (error.includes('description')) {
        errorMap.description = error;
      } else if (error.includes('color')) {
        errorMap.color = error;
      }
    });

    setErrors(errorMap);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>): Promise<void> => {
    if (e) {
      e.preventDefault();
    }
    
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await createCategory({
        ...formData,
        description: formData.description?.trim() || undefined,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        is_active: true,
      });
      setErrors({});
      
      // Notify parent component to reload categories
      if (onCategoryCreated) {
        onCategoryCreated();
      }
      
      onSuccess();
      handleClose();
    } catch (error: unknown) {
      // Type guard function for API errors
      const isApiError = (err: unknown): err is { 
        response?: { 
          status?: number; 
          data?: { 
            errors?: Record<string, string[]>; 
            message?: string; 
          }; 
        }; 
      } => {
        return (
          err !== null &&
          typeof err === 'object' &&
          'response' in err &&
          err.response !== null &&
          typeof err.response === 'object'
        );
      };

      if (isApiError(error) && error.response?.status === 422 && error.response.data?.errors) {
        const serverErrors: CategoryFormErrors = {};
        const errorData = error.response.data.errors;

        Object.keys(errorData).forEach((field) => {
          if (field in serverErrors || ['name', 'description', 'color', 'is_active'].includes(field)) {
            serverErrors[field as keyof CategoryFormErrors] = errorData[field][0];
          }
        });

        setErrors(serverErrors);
      } else {
        const errorMessage = isApiError(error) && error.response?.data?.message 
          ? error.response.data.message 
          : 'Error al crear la categoría. Inténtalo de nuevo.';
        setApiError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (): void => {
    if (!isLoading) {
      setFormData({
        name: '',
        description: '',
        color: '#3B82F6',
        is_active: true,
      });
      setErrors({});
      setApiError('');
      onClose();
    }
  };

  const predefinedColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6B7280', // Gray
  ];

  if (!isOpen) return null;

  // Form content to be rendered inside Modal
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Error Alert */}
      {apiError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Name Field */}
      <div>
        <Input
          label="Nombre *"
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Ej. Reuniones"
          disabled={isLoading}
          error={errors.name}
          fullWidth
        />
      </div>

      {/* Description Field */}
      <div>
        <Textarea
          label="Descripción"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          placeholder="Describe el propósito de esta categoría..."
          disabled={isLoading}
          error={errors.description}
          fullWidth
        />
      </div>

      {/* Color Field */}
      <ColorInput
        label="Color"
        value={formData.color || '#3B82F6'}
        onChange={(color) => setFormData((prev) => ({ ...prev, color }))}
        predefinedColors={predefinedColors}
        disabled={isLoading}
        error={errors.color}
      />

      {/* Active Status */}
      <Checkbox
        id="is_active"
        name="is_active"
        label="Categoría activa"
        checked={formData.is_active ?? true}
        onChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
        disabled={isLoading}
      />
    </form>
  );

  // Footer buttons
  const footerContent = (
    <div className="flex justify-end space-x-3">
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={isLoading}
      >
        Cancelar
      </Button>
      <Button
        type="button"
        variant="primary"
        disabled={isLoading}
        loading={isLoading}
        onClick={() => handleSubmit()}
      >
        Crear Categoría
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Crear Nueva Categoría"
      size="md"
      footer={footerContent}
    >
      {formContent}
    </Modal>
  );
};

export default CreateCategoryModal;
