import { z } from 'zod';
import { useTranslation } from 'react-i18next';

export const useLoginSchema = () => {
    const { t } = useTranslation();
    return z.object({
        username: z.string().min(1, t('validation.usernameRequired')),
        password: z.string().min(1, t('validation.passwordRequired')),
    });
};

export const useRegisterSchema = () => {
    const { t } = useTranslation();
    return z.object({
        username: z.string().min(1, t('validation.usernameRequired')),
        email: z.string().email(t('validation.emailInvalid')),
        password: z.string().min(6, t('validation.passwordMin')),
        role: z.enum(['ADMIN', 'USER'], { errorMap: () => ({ message: t('validation.roleRequired') }) }),
    });
};
