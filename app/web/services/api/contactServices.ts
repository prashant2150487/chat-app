import { ApiResponse, contact } from './../../types/api.types';


import axiosInstance from "@/config/axios"
import { BASE, ENDPOINTS } from "../endPoints"




export const contactService ={
    getContact: async (): Promise<contact[]> =>{
        try{
            const res= await axiosInstance.get<ApiResponse<contact[]>>(`${BASE}${ENDPOINTS.CONTACT.ALL_CONTACT}`)
            return res.data.data ??[] as contact[]
        }catch(err){
            throw new Error("Failed to fetch contacts")
        }
    },
    addContactByPhone: async (phone: string): Promise<contact> =>{
        try{
            const res = await axiosInstance.post<ApiResponse<contact>>(`${BASE}${ENDPOINTS.CONTACT.ADD_BY_PHONE}`, { phone })
            return res.data.data as contact
        }catch(err: any){
            const message = err.response?.data?.message || "Failed to add contact by phone"
            throw new Error(message)
        }
    }
}