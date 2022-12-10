import defaultAvatar from '@/assets/images/avatars/avatar-8.png'
import { defineStore } from 'pinia'
import { computed, inject, ref } from 'vue'

export const UserType = {
  CHEF: 'EC',
  DELIVERY: 'ED',
  MANAGER: 'EM',
  CUSTOMER: 'C',
}

export const PaymentTypes = {
  VISA: 'VISA',
  PAYPAL: 'PAYPAL',
  MBWAY: 'MBWAY',
}

export const userTypes = [UserType.CHEF, UserType.DELIVERY, UserType.MANAGER, UserType.CUSTOMER]

export const paymentTypes = [PaymentTypes.MBWAY, PaymentTypes.PAYPAL, PaymentTypes.VISA]

export const useUserStore = defineStore('user', () => {
  const axios = inject('axios')
  const serverBaseUrl = inject('serverBaseUrl')
  const toast = inject('toast')

  const user = ref(null)
  const customer = ref(null)

  const userPhoto = computed(() => {
    if (!user.value?.photo_url) {
      return defaultAvatar
    }
    return serverBaseUrl + '/api/image/' + user.value.photo_url
  })

  const isManager = computed(() => {
    return isType(UserType.MANAGER)
  })

  const isChef = computed(() => {
    return isType(UserType.CHEF)
  })

  const isCustomer = computed(() => {
    return isType(UserType.CUSTOMER)
  })

  const isDelivery = computed(() => {
    return isType(UserType.DELIVERY)
  })

  const isAnonymous = computed(() => {
    return user.value == null
  })

  const isLogged = computed(() => {
    return !isAnonymous
  })

  function isType(type) {
    return user.value?.type == type
  }

  async function updatePassword(password, confirmation, callback = null) {
    if (password && confirmation) {
      if (password == confirmation) {
        axios
          .post('/change-password', {
            password: `${password}`,
            password_confirmation: `${confirmation}`,
          })
          .then(res => {
            toast.success(res.message ?? 'Password changes with success! 🤗')
            if (callback) {
              callback(true)
            }
          })
          .catch(err => {
            toast.error(err.response.data.message)
            callback(false)
          })
      } else {
        toast.error("Passwords don't match. 😮")
      }
    } else {
      toast.error('Write something at least. 😑')
    }
    return null
  }

  async function updateUser(id, userData, callback = null) {
    axios
      .patch(`/users/${id}`, userData)
      .then(res => {
        toast.success(res.data.message)
        user.value = res.data.data
        if (callback) {
          callback(true)
        }
      })
      .catch(err => {
        toast.error(err.response.data.message)
        if (callback) {
          callback(false)
        }
      })
  }

  async function updateCustomer(id, userData, callback = null) {
    axios
      .patch(`/customers/${id}`, userData)
      .then(res => {
        toast.success(res.data.message)
        customer.value = res.data.data.customer
        if (callback) {
          callback(true)
        }
      })
      .catch(err => {
        toast.error(err.response.data.message)
        if (callback) {
          callback(false)
        }
      })
  }

  const userId = computed(() => {
    return user.value?.id ?? -1
  })

  const customerId = computed(() => {
    return customer.value?.id ?? -1
  })

  async function loadUser() {
    try {
      const response = await axios.get('users/me')
      user.value = response.data.data
      customer.value = response.data.data?.customer ?? null
    } catch (error) {
      clearUser()
      throw error
    }
  }

  function clearUser() {
    delete axios.defaults.headers.common.Authorization
    sessionStorage.removeItem('token')
    user.value = null
  }

  async function login(credentials) {
    try {
      const response = await axios.post('login', credentials)
      axios.defaults.headers.common.Authorization = 'Bearer ' + response.data.token

      //Remember me
      if (credentials.remember) sessionStorage.setItem('token', response.data.token)

      await loadUser()
      return true
    } catch (error) {
      clearUser()
      return false
    }
  }

  async function logout() {
    try {
      await axios.post('logout')
      clearUser()
      return true
    } catch (error) {
      return false
    }
  }

  async function restoreToken() {
    let storedToken = sessionStorage.getItem('token')
    if (storedToken) {
      axios.defaults.headers.common.Authorization = 'Bearer ' + storedToken
      await loadUser()
      return true
    }
    clearUser()
    return false
  }

  return {
    user,
    userId,
    userPhoto,
    customer,
    customerId,
    login,
    logout,
    restoreToken,
    isType,
    isChef,
    isCustomer,
    isDelivery,
    isManager,
    updatePassword,
    updateUser,
    updateCustomer,
    loadUser,
    isAnonymous,
    isLogged,
  }
})
