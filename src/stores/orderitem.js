import websockets from '@/utils/websockets'
import { defineStore } from 'pinia'
import { inject } from 'vue'

export const OrderItemStatus = {
  WAITING: 'W',
  PREPARING: 'P',
  READY: 'R',
}

export const useOrderItemStore = defineStore('orderitem', () => {
  const axios = inject('axios')
  const soc = websockets()

  async function set(item, type) {
    return await axios
      .patch(`orderitems/${item.id}`, {
        status: type,
      })
      .finally(() => {
        soc.send('board-update', item)
      })
  }

  return {
    set,
  }
})