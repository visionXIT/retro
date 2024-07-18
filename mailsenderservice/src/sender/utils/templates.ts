export const templateBrandingMail = (text: string) => `
  <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              .header {
                width: 100%;
                height: 70px;
                background-color: rgba(40, 40, 40, 1);
                color: rgba(180, 241, 54, 1);
                display: flex;
                align-items: center;
                font-size: 31px;
                font-weight: 600;
                padding-left: 10px;
                -webkit-box-shadow: 0px 12px 15px -1px rgba(180, 241, 54, 0.3);
                -moz-box-shadow: 0px 12px 15px -1px rgba(180, 241, 54, 0.3);
                box-shadow: 0px 12px 15px -1px rgba(180, 241, 54, 0.3);              
              }
              .text {
                font-weight: 400;
                padding: 50px;
                color: rgba(232, 232, 232, 1);
                background-color: rgba(40, 40, 40, 0.8);
              }
              .alarm {
                font-size: 12px;
                padding-top: 30px;
                background-color: rgba(40, 40, 40, 0.8);
                color: rgba(232, 232, 232, 0.8);
                padding-left: 10px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
              }
            </style>
          </head>
          <body>
            <div class="header">Retro</div>
            <div class="text">
              ${text}
            </div>
            <div class="alarm">Будьте внимательны - не нужно отвечать на это сообщение. Письмо сгенерировано автоматические</div>
          </body>
        </html>
`;
