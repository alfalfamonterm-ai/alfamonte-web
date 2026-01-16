import { Resend } from 'resend';


let _resend: Resend | null = null;
const getResend = () => {
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_for_build');
    }
    return _resend;
};

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://alfamonte.cl';

export const sendOrderConfirmationEmail = async (email: string, orderId: string, total: number) => {
    try {
        const { data, error } = await getResend().emails.send({
            from: 'Alfa.Monte <pedidos@alfamonte.cl>',
            to: email,
            subject: `Confirmación de Pedido #${orderId.slice(0, 8).toUpperCase()}`,
            html: `
                <div style="font-family: sans-serif; color: #2D4A3E; max-width: 600px; margin: auto;">
                    <img src="https://images.unsplash.com/photo-1585110396067-bf0014455cfa?auto=format&fit=crop&w=600&q=80" alt="Conejito Feliz" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px 10px 0 0;" />
                    <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
                        <h1 style="color: #2D4A3E; margin-top: 0;">¡Hola! 🐰</h1>
                        <p>Hemos recibido tu pedido con éxito. Estamos preparando lo mejor del campo para tu mascota.</p>
                        <div style="background: #F4F1EA; padding: 20px; border-radius: 10px;">
                            <p><strong>N° de Orden:</strong> ${orderId.slice(0, 8).toUpperCase()}</p>
                            <p><strong>Total:</strong> $${total.toLocaleString()}</p>
                        </div>
                        <p>Puedes seguir tu pedido aquí: <a href="${BASE_URL}/track/${orderId}">Seguimiento en Tiempo Real</a></p>
                        <p>¡Gracias por confiar en Alfa.Monte!</p>
                    </div>
                </div>
            `
        });
        if (error) {
            console.error('Resend Error:', error);
            throw error;
        }
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
};

export const sendShippingUpdateEmail = async (email: string, orderId: string, status: string, provider?: string, tracking?: string) => {
    try {
        const { error } = await getResend().emails.send({
            from: 'Logística Alfa.Monte <despachos@alfamonte.cl>',
            to: email,
            subject: `Actualización de Envío: Pedido #${orderId.slice(0, 8).toUpperCase()}`,
            html: `
                <div style="font-family: sans-serif; color: #2D4A3E; max-width: 600px; margin: auto;">
                    <h2>¡Tu pedido tiene novedades!</h2>
                    <p>El estado actual es: <strong>${status}</strong></p>
                    ${provider ? `<p><strong>Transporte:</strong> ${provider}</p>` : ''}
                    ${tracking ? `<p><strong>Código de Seguimiento:</strong> ${tracking}</p>` : ''}
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                    <p>Sigue el detalle aquí: <a href="${BASE_URL}/track/${orderId}">Hacer Seguimiento</a></p>
                </div>
            `
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error sending shipping update email:', error);
    }
};

export const sendLoyaltyPointsEmail = async (email: string, points: number, totalPoints: number) => {
    try {
        const { error } = await getResend().emails.send({
            from: 'Fidelidad Alfa.Monte <club@alfamonte.cl>',
            to: email,
            subject: `¡Has ganado ${points} puntos Alfa.Monte! 🌿`,
            html: `
                <div style="font-family: sans-serif; color: #2D4A3E; max-width: 600px; margin: auto; text-align: center;">
                    <h1 style="font-size: 40px;">🌿</h1>
                    <h2>¡Felicidades!</h2>
                    <p>Por tu reciente compra has sumado <strong>${points} puntos</strong>.</p>
                    <div style="background: #2D4A3E; color: white; padding: 30px; border-radius: 20px; margin: 20px 0;">
                        <p style="text-transform: uppercase; font-size: 12px; margin-bottom: 5px; opacity: 0.7;">Saldo Actual</p>
                        <p style="font-size: 48px; font-weight: bold; margin: 0;">${totalPoints} pts</p>
                    </div>
                    <p>Revisa tus beneficios en tu <a href="${BASE_URL}/account">Portal del Cliente</a>.</p>
                </div>
            `
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error sending loyalty email:', error);
    }
};

export const sendAbandonedCartEmail = async (email: string, cartItems: any[]) => {
    try {
        const itemsList = cartItems.map(item => `<li>${item.quantity}x ${item.product_title || 'Producto'}</li>`).join('');
        const { error } = await getResend().emails.send({
            from: 'Alfa.Monte <hola@alfamonte.cl>',
            to: email,
            subject: '¿Olvidaste algo delicioso para tu mascota? 🌿',
            html: `
                <div style="font-family: sans-serif; color: #2D4A3E; max-width: 600px; margin: auto;">
                    <h1>¡Tu carrito te extraña!</h1>
                    <p>Vimos que dejaste algunos productos seleccionados. Todavía están reservados para ti.</p>
                    <ul style="background: #F4F1EA; padding: 20px; border-radius: 10px; list-style: none;">
                        ${itemsList}
                    </ul>
                    <p>Haz click aquí para terminar tu compra y recibir lo mejor del campo:</p>
                    <a href="${BASE_URL}/cart" style="display: inline-block; background: #2D4A3E; color: white; padding: 15px 25px; border-radius: 10px; text-decoration: none; font-weight: bold;">Regresar al Carrito</a>
                </div>
            `
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error sending abandoned cart email:', error);
    }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
    try {
        const { error } = await getResend().emails.send({
            from: 'Alfa.Monte <bienvenida@alfamonte.cl>',
            to: email,
            subject: '¡Bienvenido a la familia Alfa.Monte! 🌿',
            html: `
                <div style="font-family: sans-serif; color: #2D4A3E; max-width: 600px; margin: auto; text-align: center;">
                    <h1 style="color: #2D4A3E;">¡Hola ${name}!</h1>
                    <p>Estamos muy felices de que te unas a nuestra comunidad de amantes de las mascotas.</p>
                    <p>En Alfa.Monte nos esforzamos por traer lo mejor del campo directamente a tu puerta.</p>
                    <div style="margin: 30px 0; border: 1px solid #eee; padding: 20px; border-radius: 20px;">
                        <p style="font-weight: bold;">Como nuevo miembro, ya tienes:</p>
                        <p>🎁 Acceso a tu Portal de Cliente</p>
                        <p>🌿 Programa de Puntos Activo</p>
                        <p>📦 Seguimiento de compras en tiempo real</p>
                    </div>
                    <p><a href="${BASE_URL}/shop" style="color: #2D4A3E; font-weight: bold;">Explorar la Tienda</a></p>
                </div>
            `
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

export const sendAccountCreatedEmail = async (email: string, tempPass: string, points: number) => {
    try {
        const { error } = await getResend().emails.send({
            from: 'Alfa.Monte <bievenida@alfamonte.cl>',
            to: email,
            subject: '🌿 Tu cuenta en Alfa.Monte ha sido creada',
            html: `
                <div style="font-family: sans-serif; color: #2D4A3E; max-width: 600px; margin: auto;">
                    <h1>¡Bienvenido a la familia! 🐰</h1>
                    <p>Hemos creado tu cuenta automáticamente con tu compra para que no pierdas tus puntos.</p>
                    
                    <div style="background: #F4F1EA; padding: 25px; border-radius: 20px; border: 2px dashed #2D4A3E; margin: 20px 0;">
                        <p style="text-transform: uppercase; font-size: 14px; font-weight: bold; margin-bottom: 15px;">🔑 Tu Llave de Acceso</p>
                        
                        <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 10px;">
                            <p style="margin: 0; font-size: 12px; color: #666;">Correo Electrónico:</p>
                            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 16px;">${email}</p>
                        </div>

                        <div style="background: white; padding: 15px; border-radius: 10px;">
                            <p style="margin: 0; font-size: 12px; color: #666;">Contraseña Provisoria:</p>
                            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 20px; letter-spacing: 2px; color: #E53E3E;">${tempPass}</p>
                        </div>
                        <p style="font-size: 11px; margin-top: 10px; color: #666;">(Copia esta contraseña para ingresar)</p>
                    </div>

                    <div style="background: #FFF9E6; border: 1px solid #FFEBB3; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
                        <p style="margin: 0; color: #856404; font-weight: bold;">👇 Pasos para activar tus ${points} puntos:</p>
                        <ol style="margin: 10px 0 0 20px; font-size: 14px; color: #856404;">
                            <li>Copia la contraseña provisoria de arriba.</li>
                            <li>Haz clic en el botón verde.</li>
                            <li>Pega la contraseña en "Password".</li>
                            <li>Ve a "Mi Perfil" y crea una contraseña nueva.</li>
                        </ol>
                    </div>

                    <div style="text-align: center;">
                        <a href="${BASE_URL}/login?email=${encodeURIComponent(email)}" style="display: inline-block; background: #2D4A3E; color: white; padding: 15px 30px; border-radius: 10px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            Ir a Iniciar Sesión
                        </a>
                    </div>
                </div>
            `
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error sending account created email:', error);
    }
};

export const sendPasswordChangedConfirmationEmail = async (email: string) => {
    try {
        await getResend().emails.send({
            from: 'Seguridad Alfa.Monte <seguridad@alfamonte.cl>',
            to: email,
            subject: '✅ Tu contraseña ha sido actualizada',
            html: `
                <div style="font-family: sans-serif; color: #2D4A3E; max-width: 600px; margin: auto; text-align: center;">
                    <h2>Seguridad Confirmada</h2>
                    <p>Te informamos que la contraseña de tu cuenta Alfa.Monte ha sido cambiada exitosamente.</p>
                    <p>Si no realizaste este cambio, por favor contáctanos de inmediato.</p>
                    <a href="${BASE_URL}/account" style="color: #2D4A3E; font-weight: bold;">Ir a mi perfil</a>
                </div>
            `
        });
    } catch (error) {
        console.error('Error sending password change confirmation:', error);
    }
};

export const sendLoyaltyWelcomeEmail = async (email: string, name: string, points: number) => {
    try {
        await getResend().emails.send({
            from: 'Fidelidad Alfa.Monte <club@alfamonte.cl>',
            to: email,
            subject: '✨ ¡Tus puntos ya son oficialmente tuyos!',
            html: `
                <div style="font-family: sans-serif; color: #2D4A3E; max-width: 600px; margin: auto;">
                    <h1 style="text-align: center;">🎉 ¡Felicidades ${name}!</h1>
                    <p>Al asegurar tu cuenta, tus <strong>${points} puntos</strong> han sido bloqueados y ya no tienen fecha de vencimiento.</p>
                    <div style="background: #2D4A3E; color: white; padding: 30px; border-radius: 20px; text-align: center; margin: 25px 0;">
                        <span style="font-size: 48px; font-weight: bold;">${points} pts</span>
                        <p style="margin-top: 10px; opacity: 0.8;">Listos para ser usados en canjes</p>
                    </div>
                    <h3>¿Cómo funcionan tus puntos?</h3>
                    <ul style="color: #555;">
                        <li>Por cada $1.000 de compra ganas 1 punto.</li>
                        <li>Canjea tus puntos por descuentos en fardos, mixes o accesorios.</li>
                        <li>Siendo miembro del Club Alfa.Monte tendrás acceso a ventas privadas.</li>
                    </ul>
                    <p style="text-align: center; margin-top: 30px;">
                        <a href="${BASE_URL}/shop" style="display: inline-block; background: #2D4A3E; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: bold;">Ver recompensas</a>
                    </p>
                </div>
            `
        });
    } catch (error) {
        console.error('Error sending loyalty welcome email:', error);
    }
};

export const sendReviewRequestEmail = async (email: string, orderId: string) => {
    try {
        const { error } = await getResend().emails.send({
            from: 'Alfa.Monte <feedback@alfamonte.cl>',
            to: email,
            subject: '¿Qué te pareció tu pedido Alfa.Monte? 🐰',
            html: `
                <div style="font-family: sans-serif; color: #2D4A3E; max-width: 600px; margin: auto;">
                    <h1>Tu opinión nos importa mucho</h1>
                    <p>Esperamos que tu mascota esté disfrutando mucho su pedido.</p>
                    <p>Nos ayudaría mucho si pudieras dedicar 1 minuto a decirnos qué te pareció el servicio y la calidad.</p>
                    <a href="${BASE_URL}/track/${orderId}#review" style="display: inline-block; background: #8B5E3C; color: white; padding: 15px 25px; border-radius: 10px; text-decoration: none; font-weight: bold;">Dejar mi Reseña</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #777;">Al dejar una reseña sumas 25 puntos extra a tu cuenta.</p>
                </div>
            `
        });
        if (error) throw error;
    } catch (error) {
        console.error('Error sending review request email:', error);
    }
};

export const sendMissedPointsEmail = async (email: string, missedPoints: number, totalMissed: number, purchaseCount: number) => {
    try {
        const plural = purchaseCount > 1 ? 's' : '';
        await getResend().emails.send({
            from: 'Club Alfa.Monte <club@alfamonte.cl>',
            to: email,
            subject: '🌿 ¿Sabías que te estás perdiendo beneficios?',
            html: `
                <div style="font-family: sans-serif; color: #2D4A3E; max-width: 600px; margin: auto;">
                    <div style="text-align: center; padding: 20px;">
                        <span style="font-size: 50px;">📉</span>
                        <h1 style="color: #2D4A3E; margin-top: 10px;">¡Mira lo que te estás perdiendo!</h1>
                    </div>
                    <p>Hoy realizaste una nueva compra, pero como tu cuenta aún no está activada, <strong>no pudimos sumarte los ${missedPoints} puntos</strong> correspondientes.</p>
                    
                    <div style="background: #FFF5F5; border-left: 5px solid #E53E3E; padding: 20px; margin: 25px 0; border-radius: 0 15px 15px 0;">
                        <p style="margin: 0; color: #C53030; font-weight: bold; font-size: 18px;">
                            ${purchaseCount === 1
                    ? `Podrías haber ganado ${missedPoints} puntos hoy.`
                    : `Ya llevas ${purchaseCount} compra${plural} y has dejado pasar un total de ${totalMissed} puntos.`}
                        </p>
                    </div>

                    <div style="background: #F4F1EA; padding: 25px; border-radius: 20px; text-align: center;">
                        <h3 style="margin-top: 0;">¿Por qué activar tu cuenta?</h3>
                        <ul style="text-align: left; color: #555; display: inline-block;">
                            <li>🌿 Acumula puntos en cada compra.</li>
                            <li>🎁 Canjea puntos por fardos y snacks gratis.</li>
                            <li>📦 Gestiona tus pedidos y suscripciones fácilmente.</li>
                        </ul>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                        <p>Solo necesitas entrar al portal y cambiar tu contraseña provisoria para empezar a ganar.</p>
                        <a href="${BASE_URL}/login" style="display: inline-block; background: #2D4A3E; color: white; padding: 18px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">Activar mi Cuenta y Ganar Beneficios</a>
                    </div>
                    
                    <p style="text-align: center; font-size: 13px; color: #888; margin-top: 30px;">
                        Tu mascota y tu bolsillo te lo agradecerán. ¡Te esperamos en el Club!
                    </p>
                </div>
            `
        });
    } catch (error) {
        console.error('Error sending missed points email:', error);
    }
};

/**
 * ACCOUNTS RECEIVABLE: CUSTOMER NOTIFICATIONS
 */

export const sendPaymentReminderEmail = async (email: string, customerName: string, amount: number, dueDate: string, detail: string) => {
    try {
        await getResend().emails.send({
            from: 'Cobranza Alfa.Monte <finanzas@alfamonte.cl>',
            to: email,
            subject: `Recordatorio de Pago: Saldo Pendiente $${amount.toLocaleString()} 🌾`,
            html: `
                <div style="font-family: sans-serif; color: #2D4A3E; max-width: 600px; margin: auto;">
                    <h2 style="color: #2D4A3E;">Hola ${customerName},</h2>
                    <p>Esperamos que estés muy bien. Te enviamos este mensaje como un recordatorio amable sobre tu saldo pendiente con Alfa.Monte.</p>
                    
                    <div style="background: #F4F1EA; padding: 25px; border-radius: 20px; margin: 25px 0; border-left: 5px solid #2D4A3E;">
                        <p style="margin: 0; font-size: 14px; text-transform: uppercase; opacity: 0.7;">Resumen de Deuda</p>
                        <p style="font-size: 32px; font-weight: bold; margin: 10px 0;">$${amount.toLocaleString()}</p>
                        <p style="margin: 0;"><strong>Vencimiento:</strong> ${new Date(dueDate).toLocaleDateString('es-CL')}</p>
                        <p style="margin: 0;"><strong>Detalle:</strong> ${detail}</p>
                    </div>

                    <p>Puedes realizar el pago vía transferencia bancaria:</p>
                    <div style="background: #EBF1EF; padding: 20px; border-radius: 12px; font-size: 14px;">
                        <strong>Datos de Transferencia:</strong><br/>
                        Banco: Banco de Chile<br/>
                        Tipo: Cuenta Corriente<br/>
                        Número: 1234567890<br/>
                        RUT: 12.345.678-9<br/>
                        Email: pagos@alfamonte.cl
                    </div>

                    <p style="margin-top: 25px;">Si ya realizaste el pago, por favor ignora este mensaje o envíanos el comprobante.</p>
                    <p>¡Muchas gracias por tu preferencia!</p>
                </div>
            `
        });
    } catch (error) {
        console.error('Error sending payment reminder:', error);
    }
};

export const sendAdminDebtAlert = async (customerName: string, amount: number, daysOverdue: number, detail: string) => {
    try {
        await getResend().emails.send({
            from: 'Sistema Alfa.Monte <alertas@alfamonte.cl>',
            to: 'fardosalfamonte@gmail.com', // Admin email
            subject: `⚠️ ALERTA DE DEUDA: ${customerName} ($${amount.toLocaleString()})`,
            html: `
                <div style="font-family: sans-serif; color: #2D4A3E; max-width: 600px; margin: auto; border: 2px solid #E53E3E; padding: 20px; border-radius: 20px;">
                    <h2 style="color: #E53E3E;">Alerta de Pago Vencido</h2>
                    <p>El siguiente cliente tiene una deuda vencida:</p>
                    
                    <ul>
                        <li><strong>Cliente:</strong> ${customerName}</li>
                        <li><strong>Monto:</strong> $${amount.toLocaleString()}</li>
                        <li><strong>Días de Atraso:</strong> ${daysOverdue} días</li>
                        <li><strong>Detalle:</strong> ${detail}</li>
                    </ul>

                    <p style="font-weight: bold; text-align: center; background: #FFF5F5; padding: 15px; border-radius: 10px;">
                        Acción Requerida: Contactar al cliente o suspender próximos despachos.
                    </p>
                </div>
            `
        });
    } catch (error) {
        console.error('Error sending admin debt alert:', error);
    }
};
