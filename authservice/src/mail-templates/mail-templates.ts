export const registerAccountTemplate = (mailParams: IMailParams) => {
    return `
    <tr>
        <td class="pd-30-70">
            <h1>Регистрация прошла успешо</h1>
        </td>
    </tr>
    <tr>
        <td class="pd-0-70">
            <span class="roboto-mono">Привет, охотник за дропами! Поздравляем с регистрацией в Retro!</span><br />
            <span class="roboto-mono">Теперь ты официально в игре. Готов автоматизировать рутину?</span><br />
            <span class="roboto-mono">Сохрани свой логин и пароль для входа в личный кабинет. Используй логин, указанный при регистрации, или адрес электронной почты.</span>
        </td>
    </tr>
    ${mailContent(mailParams)}
    `;
}

export const restorePasswordTemplate = (mailParams: IMailParams) => {
    return `
    <tr>
        <td class="pd-30-70">
            <h1>Восстановление пароля</h1>
        </td>
    </tr>
    <tr>
        <td class="pd-0-70">
            <span class="roboto-mono">Ты запросил изменение пароля для аккаунта в Retro.</span><br />
            <span class="roboto-mono">Наша система сгенерировала новый пароль. Теперь ты можешь войти в свой аккаунт и продолжить пользоваться всеми возможностями.</span><br />
            <span class="roboto-mono">Не забудь изменить его после того, как войдешь в личный кабинет.</span>
        </td>
    </tr>
    ${mailContent(mailParams)}
    `;
}

export const updatePasswordTemplate = (mailParams: IMailParams) => {
    return `
    <tr>
        <td class="pd-30-70">
            <h1>Вы успешно изменили пароль</h1>
        </td>
    </tr>
    <tr>
        <td class="pd-0-70">
            <span class="roboto-mono">Ты запросил изменение пароля для аккаунта в Retro.</span><br />
            <span class="roboto-mono">Теперь ты можешь войти в свой аккаунт и продолжить пользоваться всеми возможностями.</span><br />
        </td>
    </tr>
    ${mailContent(mailParams)}
    `
}

export const updateLoginTemplate = (mailParams: IMailParams) => {
    return `
    <tr>
        <td class="pd-30-70">
            <h1>Вы успешно изменили логин</h1>
        </td>
    </tr>
    <tr>
        <td class="pd-0-70">
            <span class="roboto-mono">Ты запросил изменение логина для аккаунта в Retro.</span><br />
            <span class="roboto-mono">Теперь ты можешь войти в свой аккаунт под новым логином и продолжить пользоваться всеми возможностями.</span><br />
        </td>
    </tr>
    ${mailContent(mailParams)}
    `
}

export const updateEmailTemplate = (mailParams: IMailParams) => {
    return `
    <tr>
        <td class="pd-30-70">
            <h1>Вы успешно изменили адрес электронной почты</h1>
        </td>
    </tr>
    <tr>
        <td class="pd-0-70">
            <span class="roboto-mono">Ты запросил изменение почты для аккаунта в Retro.</span><br />
            <span class="roboto-mono">Теперь ты можешь войти в свой аккаунт под новым адресом почты и продолжить пользоваться всеми возможностями.</span><br />
        </td>
    </tr>
    ${mailContent(mailParams)}
    `
}


export const verificationEmailTemplate = (verificationCode: string | number) => {
    return `
    <tr>
        <td class="pd-30-70">
            <h1>Вы получили код верификации</h1>
        </td>
    </tr>
    <tr>
        <td class="pd-30-70">
            <div style="width: 100%; background-color: #282828; border-radius: 8px; border-left: 4px solid #F442CC;">
                <div style="padding: 20px;">
                    <span class="roboto-mono" style="color: #939393; font-size:24px;">${verificationCode}</span> <br/>
                </div>
            </div>
        </td>
    </tr>
    `
}


const mailContent = (mailParams: IMailParams) => {
    return `
    <tr>
        <td class="pd-30-70">
            <div style="width: 100%; background-color: #282828; border-radius: 8px; border-left: 4px solid #F442CC;">
                <div style="padding: 20px;">
                    <span class="roboto-mono" style="color: #939393;">Логин: ${mailParams.login}</span> <br/>
                    <span class="roboto-mono" style="color: #939393;">Пароль: ${mailParams.password}</span>
                </div>
            </div>
        </td>
    </tr>
    `;
}




export interface IMailParams {
    login: string; 
    password: string;
}