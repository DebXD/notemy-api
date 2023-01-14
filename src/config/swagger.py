template = {
    "swagger": "2.0",
    "info": {
        "title": "Notemy API",
        "description": "API for Notemy",
        "contact": {
            "responsibleOrganization": "Swagger",
            "responsibleDeveloper": "https://github.com/debxd/",
            "email": "debxd@duck.com",
            "url": "www.twitter.com/debiprasadxd",
        },
        "termsOfService": "http://swagger.io/terms/",
        "version": "1.0"
    },
    "basePath": "/api/v1",  # base bash for blueprint registration
    "schemes": [
        "http",
        "https"
    ],
    # "securitySchemes": {
    #     "bearerAuth": {
    #         "type": "http"
    #     },
    #     "scheme": {
    #         "bearer"
    #     },
    #     "bearerFormat": {
    #         "JWT"
    #     }


    # },

    # "securityDefinitions": {
    #     "Bearer": {
    #         "type": "apiKey",
    #         "name": "Authorization",
    #         "in": "header",
    #         "description": "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
    #     }
    # },
    # "security": {
    #     "Bearer": []
    # }
}

swagger_config = {
    "headers": [
    ],
    "specs": [
        {
            "endpoint": 'apispec',
            "route": '/apispec.json',
            "rule_filter": lambda rule: True,  # all in
            "model_filter": lambda tag: True,  # all in
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/"
}
