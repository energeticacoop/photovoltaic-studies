/**
 * Retrieves final study templates.
 * @returns {Array} Array of final study template.
 */
function getFinalStudyTemplates() {
  return [
    {
      templateName: getValue("nombreFichero"),
      templateId: "13ldY9Q8bK7ijZSauJYD2piVbyYfYKtTPjf7qdhWTE6k",
      exportToPDF: false,
      copyComments: true,
      folder: "folder01",
    },
  ]
}

/**
 * Retrieves templates for folder 00.
 * @returns {Array} Array of templates for folder 00.
 */
function get00FolderTemplates() {
  const templates = [
    {
      templateName: "DROU - Acreditación de la representación",
      templateId: "1yGMRXtlaPxqdQqUzeaJO8PFFleWaWgUzxm6Zva1u2GU",
      exportToPDF: true,
      folder: "folder0200",
    },
    {
      templateName: "Contrato de instalación",
      templateId: "1ElIx5TtbT7y7iUawq8IC6W1KpR7e9hLeABwHkaD15S8",
      exportToPDF: false,
      folder: "folder0200"
    },
    {
      templateName: "BIE  - Acreditación de la representación",
      templateId: "1EdUm7oKmbVTkHy-wS2VdLkA4MjJNxPw1AbOk-nEKaN4",
      exportToPDF: true,
      folder: "folder0200"
    },
  ]

  if (getValue("province").trim() == "Valladolid") templates.push(
    {
      templateName: "VLL - Solicitud inscripción Industria ST",
      templateId: "1cC0bJJjOynwr_3dQq0H26SILowwXflj4Kv6OzD2rp6g",
      exportToPDF: true,
      folder: "folder0200"
    }
  )

  return templates
}


/**
 * Retrieves templates for folder 01.
 * @returns {Array} Array of templates for folder 01.
 */
function get01FolderTemplates() {
  const templates = [
    {
      templateName: "Presupuesto Ejecución Material - Ayto",
      templateId: "1Q7aRFNjqB_Kc9daRPDRhs2kqt7XuZMYmhGRQjLVHBY8",
      exportToPDF: true,
      copyComments: false,
      folder: "folder0201",
    },
    {
      templateName: "Compromiso dirección de obra",
      templateId: "1Pk3IS0Uz1Jj7R-AyNff5F0rqPJrBulJTYsQU2DYET5k",
      exportToPDF: true,
      folder: "folder0201"
    }, 
    {
      templateName: "Declaración responsable Técnico",
      templateId: "1Yz2U2J5zfDCPm_abDMUKVnmZyW6AFVHKUMwYTdFwyCE",
      exportToPDF: true,
      folder: "folder0201"
    },
    {
      templateName: "Solicitud bonificación ICIO",
      templateId: "1TPeCE6wXHIQuVxVvjZyYcME6H83hPfO6QJV9WNmBPnk",
      exportToPDF: true,
      folder: "folder0201"
    },
    {
      templateName: "Comunicación ambiental",
      templateId: "1DAlTAw-pZk6Rd8-lT818PFkaIthy0PLSKKvrzEIocTA",
      exportToPDF: false,
      copyComments: true,
      folder: "folder0201"
    },
  ]

  if (!getValue("withproject")) templates.push(
    {
      templateName: "Certificado final de obra",
      templateId: "1Pgytz6cEZlbotL2St31JJDTbir0gUi4rP2ipGb4qPac",
      exportToPDF: false,
      folder: "folder0201"
    },
  )
  return templates
}

/**
 * Retrieves templates for Project Memory.
 * @returns {Array} Array of templates for Project Memory.
 */
function getMemoryTemplates() {
  return [
    {
      templateName: "Memoria técnica",
      templateId: "1uxoE7-2P41jCHrwnVDRCFHFreeU7NgsI7uonWOVDGAc",
      exportToPDF: false,
      copyComments: true,
      folder: "folder0201",
    },
  ]
}

/**
 * Retrieves templates for Project.
 * @returns {Array} Array of templates for Project.
 */
function getProjectTemplates() {
  return [
    {
      templateName: "Proyecto de instalación",
      templateId: "1Bvew-cjAp2q8yMEgPyS3Guab_hHUkp1Z5JYz_U2oSl0",
      exportToPDF: false,
      copyComments: true,
      folder: "folder0201",
    },
  ]
}


/**
 * Retrieves templates for Installation Guide.
 * @returns {Array} Array of templates for Installation Guide.
 */
function getGuideTemplates() {
  return [
    {
      templateName: "Guía de instalación",
      templateId: "1k9lYTmxMsINC6U49w1NWOu0-3dGkYUBF5yrhKmkGb04",
      exportToPDF: false,
      folder: "folder03",
    },
  ]
}

/**
 * Retrieves templates for Bill.
 * @returns {Array} Array of templates for Bill.
 */
function getBillTemplates() {
  return [
    {
      templateName: "Factura",
      templateId: "1xttGTW5xY0mnyuCEU8gEQwQ926WH4vTG0mZS4CEKuJQ",
      exportToPDF: false,
      folder: "folder02",
    },
  ]
}

/**
 * Retrieves templates for folder 01.
 * @returns {Array} Array of templates for folder 02.
 */
function get02FolderTemplates() {
  return [
    {
      templateName: "Manual usuario",
      templateId: "1J_RAwFGlkYCnlTqICXu3i0ogmf0xN48n8bjw1mH4S0o",
      exportToPDF: true,
      copyComments: false,
      folder: "folder0202"
    },
    {
      templateName: "Certificado reconocimiento instalación",
      templateId: "1NZhggc5SLkA2HxnjpamfgoPqCSYuKk1h0KLOJN2H-48",
      exportToPDF: false,
      copyComments: true,
      folder: "folder0202"
    },
    {
      templateName: "Anexo I datos de autoconsumo v.3",
      templateId: "1POtr51vwXX5qXUotJU5gD3jge2AMPcvJTr_QQfJ65RE",
      exportToPDF: true,
      copyComments: true,
      folder: "folder0202",
    },
  ]
}


/**
 * Retrieves templates for folder 03.
 * @returns {Array} Array of templates for folder 03.
 */
function get03FolderTemplates() {
  const templates = []
  if (getValue("province").trim() == "Valladolid") {
    templates.push(
      {
        templateName: "VLL - Plantilla A103 ABRIL - Remisión de información AC",
        templateId: "1F-JUhAtSpSxNoWs25Afe6XZb4-5IkzeGJJyxXXB7fHw",
        exportToPDF: false,
        copyComments: true,
        folder: "folder0203",
      }
    )
  } else {
    templates.push(
      {
        templateName: "Formulario Autoconsumo",
        templateId: "1icBoMi4MCBoNVakzXIg_2WneNDGXmTAbJOXX3RY3ZqI",
        exportToPDF: false,
        copyComments: true,
        folder: "folder0203"
      }
    )
  }

  if (getValue("province").trim() == "León") {
    templates.push(
      {
        templateName: "Datos establecimiento industrial León",
        templateId: "11iaYzBMwd1QiniKKt9HdI6FRpo7E41ZVj0gijEujV1k",
        exportToPDF: false,
        copyComments: true,
        folder: "folder0203"
      }
    )
  }

  return templates
}



/**
 * Retrieves templates for folder 04.
 * @returns {Array} Array of templates for folder 04.
 */
function get04FolderTemplates() {
  return [
    {
      templateName: "Certificado final de obra COIIM",
      templateId: "1Yi3ORUrh_-HO6eFVoi1kftE3PsHDIe6lTvvSkGBa084",
      exportToPDF: false,
      folder: "folder0204"
    },
    {
      templateName: "Asume Coordinación Seguridad y Salud",
      templateId: "16VQsGA3z-Q--cdLx4U-Nqye1IOAIbq1k86vWGfkkOco",
      exportToPDF: false,
      folder: "folder0204"
    },
    {
      templateName: "Asume Dirección Técnica",
      templateId: "1j7Ozyh6P8-Mj-pW1noTKTVPTwNco89jy-eJ0HYSbMJQ",
      exportToPDF: false,
      folder: "folder0204"
    },
    {
      templateName: "Acta Aprobación Plan SyS",
      templateId: "1QZ0q4Bibj_rRAUvOpAK0fW29VfjdlhiyCCSaT9RYFsU",
      exportToPDF: true,
      folder: "folder0204"
    },
    {
      templateName: "Plan de Seguridad y Salud",
      templateId: "1DjSwmbcsmTj2mhn7o4381f5X4t90K7cVPwxzCV9hjG8",
      exportToPDF: false,
      folder: "folder0204"
    },
    {
      templateName: "Requisitos para obras de proyectos",
      templateId: "1yTK-NfmzCabqI6M8-BaDRfiNENB2KNQrsqViJYECzT8",
      exportToPDF: false,
      folder: "folder0204"
    },
    {
      templateName: "Coordinador de actividades preventivas",
      templateId: "1AdFMygEZLIILYHOTsSEvYDFNy5QxBWOqEMUFFTOAgMM",
      exportToPDF: false,
      folder: "folder0204"
    },
    {
      templateName: "Coordinador de actividades preventivas empresas concurrentes",
      templateId: "1FXxZLvTLiieihKDwIeEvLv2jHi6K82GR6DdaJpVwfPk",
      exportToPDF: false,
      folder: "folder0204"
    },
    {
      templateName: "En caso de accidente, acudir a",
      templateId: "18CcpHMTNTcigSFjPun4Kkp_8rYuRKKPu8gr8MEjzGWs",
      exportToPDF: false,
      folder: "folder0204"
    },
    {
      templateName: "Itinerario evacuaciones de accidentados",
      templateId: "19UpA6bcso9_v00Kwg7VXOQofgvVKmWi0fGFBmvB6dJE",
      exportToPDF: false,
      folder: "folder0204"
    },
    {
      templateName: "Normas de autorización uso maquinaria",
      templateId: "1TMws2DavUsAJx2TTA_iQ6Vo8tKu06ko5Qy6bQ53wFhM",
      exportToPDF: false,
      folder: "folder0204"
    },
    {
      templateName: "Recurso preventivo - Actividades que desempeñar",
      templateId: "1597H4SXlMAm7621FdNQETlro1Muy7KGOitI8FXmu4Qo",
      exportToPDF: false,
      folder: "folder0204"
    },
    {
      templateName: "Verificación de entrega EPIs",
      templateId: "1CJ2Nj0Py7QFUJr5r8t_fo5u14fw2KpJmssHWoMfE7Ug",
      exportToPDF: false,
      folder: "folder0204"
    },
  ]
}

/**
 * Retrieves templates for folder 05.
 * @returns {Array} Array of templates for folder 05.
 */
function get05FolderTemplates() {
  return [
    {
      templateName: "Modelo autorizacion de la solicitud a otro agente",
      templateId: "1IZgHMmv39FrrDvu7WyMrro_ZxDNmccWrIuyoweuzGK4",
      exportToPDF: false,
      copyComments: true,
      folder: "folder0205"
    },
    {
      templateName: "Declaración responsable de ambos agentes dando su conformidad a la solicitud",
      templateId: "12Z603mITndQU7bvgZ56pgSsqJVSeHDbi8IQXZXQeBSQ",
      exportToPDF: false,
      copyComments: true,
      folder: "folder0205"
    },
    {
      templateName: "Acuerdo de unificación de consumos de generación conectada a red interior de consumo",
      templateId: "1kcBs8XgRkCE01mAGoihtl_Hw-L0so09Y1JJ8ywvZIFo",
      exportToPDF: false,
      copyComments: true,
      folder: "folder0205"
    },
  ]
}

/**
 * Retrieves templates for Testing Document.
 * @returns {Array} Array of templates for Testing Document.
 */
function getTestTemplates() {
  return [
    {
      templateName: "Test",
      templateId: "1QXPT8zrOuKfwfVPMBqLP0SKJNW3ldRJgvDpSui8qfsM",
      exportToPDF: false,
      folder: "folder03",
    },
  ]
}

