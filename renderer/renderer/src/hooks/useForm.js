import { useState, useCallback } from 'react'

/**
 * Custom hook for form state management
 * @param {object} initialValues - Initial form values
 * @param {function} validate - Validation function
 * @returns {object} Form state and handlers
 */
const useForm = (initialValues = {}, validate) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target
      const fieldValue = type === 'checkbox' ? checked : value

      setValues((prev) => ({
        ...prev,
        [name]: fieldValue
      }))

      // Clear error when field is modified
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: ''
        }))
      }
    },
    [errors]
  )

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target
      setTouched((prev) => ({
        ...prev,
        [name]: true
      }))

      // Validate on blur
      if (validate) {
        const validationErrors = validate(values)
        if (validationErrors[name]) {
          setErrors((prev) => ({
            ...prev,
            [name]: validationErrors[name]
          }))
        }
      }
    },
    [values, validate]
  )

  const handleSubmit = useCallback(
    async (onSubmit) => {
      return async (e) => {
        e.preventDefault()

        // Mark all fields as touched
        const touchedFields = {}
        Object.keys(values).forEach((key) => {
          touchedFields[key] = true
        })
        setTouched(touchedFields)

        // Validate all fields
        if (validate) {
          const validationErrors = validate(values)
          setErrors(validationErrors)

          // If there are errors, don't submit
          if (Object.keys(validationErrors).length > 0) {
            return
          }
        }

        setIsSubmitting(true)
        try {
          await onSubmit(values)
        } catch (error) {
          console.error('Form submission error:', error)
        } finally {
          setIsSubmitting(false)
        }
      }
    },
    [values, validate]
  )

  const resetForm = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error
    }))
  }, [])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors
  }
}

export default useForm
