<template>
  <div v-if="show" class="modal-overlay" @click.self="handleCancel" role="dialog" aria-modal="true">
    <div class="modal">
      <h3 class="modal-title">{{ title }}</h3>
      <p class="modal-message">{{ message }}</p>
      <p v-if="warning" class="modal-warning">{{ warning }}</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" @click="handleCancel" :disabled="loading">
          {{ cancelText }}
        </button>
        <button :class="['btn', danger ? 'btn-danger' : 'btn-primary']" @click="handleConfirm" :disabled="loading">
          <span v-if="loading" class="btn-spinner"></span>
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const props = withDefaults(defineProps<{
  show?: boolean
  title?: string
  message?: string
  warning?: string
  confirmText?: string
  cancelText?: string
  loadingText?: string
  danger?: boolean
  loading?: boolean
}>(), {
  show: false,
  title: 'Confirmar',
  message: '¿Estás seguro?',
  warning: '',
  confirmText: 'Eliminar',
  cancelText: 'Cancelar',
  loadingText: 'Eliminando...',
  danger: true,
  loading: false
})

const handleConfirm = (): void => emit('confirm')
const handleCancel = (): void => emit('cancel')
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
}

.modal {
  background: var(--bg-primary);
  border-radius: var(--radius);
  padding: 24px;
  width: 30vh;
  min-width: 280px;
  max-width: 450px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.15s ease;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
  color: var(--text-primary);
}

.modal-message {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 8px;
  line-height: 1.4;
}

.modal-warning {
  font-size: 13px;
  color: #e74c3c;
  margin: 4px 0 16px;
  padding: 8px 12px;
  background: rgba(231, 76, 60, 0.08);
  border-radius: var(--radius-sm);
  line-height: 1.4;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  border: none;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--border);
}

.btn-danger {
  background: #e74c3c;
  color: #fff;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

.btn-primary {
  background: var(--accent);
  color: var(--bg-primary);
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .modal {
    padding: 20px;
  }
}
</style>
