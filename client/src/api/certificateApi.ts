import axiosClient from './axiosClient';
import { Certificate, ApiResponse } from '../types';

export const certificateApi = {
  getUserCertificates: async () => {
    const res = await axiosClient.get<ApiResponse<Certificate[]>>('/certificates/my-certificates');
    return res.data;
  },

  getCertificate: async (id: string) => {
    const res = await axiosClient.get<ApiResponse<Certificate>>(`/certificates/${id}`);
    return res.data;
  },

  verifyCertificate: async (certId: string) => {
    const res = await axiosClient.get<ApiResponse<{ isValid: boolean; certificate: Certificate }>>(`/certificates/verify/${certId}`);
    return res.data;
  },
};
