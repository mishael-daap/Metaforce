# SFDX Server API

Base URL: `http://localhost:8000`

---

## Authentication

All endpoints except `GET /health` require the following headers:

| Header            | Description                          | Example                              |
| ----------------- | ------------------------------------ | ------------------------------------ |
| `x-api-key`       | API key configured in `.env`         | `password`                           |
| `x-project-id`    | Project ID (used to scope files)     | `my-project-01`                      |
| `x-access-token`  | Salesforce org access token          | `00D...`                             |
| `x-org-url`       | Salesforce org instance URL          | `https://myorg.salesforce.com`       |

---

## GET /health

Health check. Returns `200` with a status payload.

### Headers
None required.

### Response

**Success — 200 OK**

```json
{
  "status": "ok",
  "timestamp": "2026-05-18T12:00:00.000Z"
}
```

---

## POST /metadata/objects

Creates a new custom object, stores the `object-meta.xml`, and deploys it to the target org.

### Headers

Requires all auth headers listed above.

### Request Body

```json
{
  "fullName": "MyObject__c",
  "label": "My Object",
  "pluralLabel": "My Objects",
  "description": "A custom object for my app",
  "deploymentStatus": "Deployed",
  "sharingModel": "ReadWrite",
  "visibility": "Public",
  "nameField": {
    "label": "My Object Name",
    "type": "Text"
  }
}
```

#### Field Reference

| Field               | Type     | Required | Description                                          |
| ------------------- | -------- | -------- | ---------------------------------------------------- |
| `fullName`          | string   | Yes      | API name. Must end in `__c`                          |
| `label`             | string   | Yes      | Singular display label                               |
| `pluralLabel`       | string   | Yes      | Plural display label                                 |
| `description`       | string   | No       | Object description                                   |
| `deploymentStatus`  | enum     | Yes      | `Deployed` or `InDevelopment`                        |
| `sharingModel`      | enum     | Yes      | `ReadWrite`, `Private`, `ControlledByParent`         |
| `visibility`        | enum     | Yes      | `Public` or `PackageProtected`                       |
| `nameField`         | object   | Yes      | Name field spec (see below)                          |
| `allowInChatterGroups` | bool  | No       | Allow in Chatter groups                              |
| `enableActivities`  | bool     | No       | Enable Activities                                  |
| `enableBulkApi`     | bool     | No       | Enable Bulk API                                    |
| `enableFeeds`       | bool     | No       | Enable feeds                                       |
| `enableHistory`     | bool     | No       | Enable history                                     |
| `enableReports`     | bool     | No       | Enable reports                                     |
| `enableSearch`      | bool     | No       | Enable search                                      |
| `enableSharing`     | bool     | No       | Enable sharing                                     |
| `enableStreamingApi`| bool     | No       | Enable Streaming API                               |

#### `nameField` Spec

| Field          | Type   | Required | Description                    |
| -------------- | ------ | -------- | ------------------------------ |
| `label`        | string | Yes      | Display label                  |
| `type`         | string | Yes      | `Text` or `AutoNumber`         |
| `displayFormat`| string | No       | Required for `AutoNumber`      |
| `scale`        | number | No       | Scale for numeric types        |
| `trackHistory` | bool   | No       | Track history                  |

### Response

**Success — 200 OK**

```json
{
  "status": true,
  "error": null,
  "createdItems": [
    {
      "name": "MyObject__c",
      "type": "CustomObject",
      "path": "/app/projects/my-project-01/force-app/objects/MyObject__c/MyObject__c.object-meta.xml"
    }
  ]
}
```

**Validation Error — 500**

```json
{
  "status": false,
  "error": "Object creation failed: fullName is required",
  "createdItems": []
}
```

---

## POST /metadata/fields

Creates a custom field on an existing custom object and deploys it.

### Headers

Requires all auth headers listed above.

### Request Body

```json
{
  "objectName": "MyObject__c",
  "field": {
    "fullName": "Description__c",
    "label": "Description",
    "type": "Text",
    "length": 255,
    "required": false
  }
}
```

#### `field` Spec

| Field                 | Type     | Required | Description                                |
| --------------------- | -------- | -------- | ------------------------------------------ |
| `fullName`            | string   | Yes      | API name. Must end in `__c`               |
| `label`               | string   | Yes      | Display label                              |
| `type`                | string   | Yes      | See **Field Types** below                  |
| `description`         | string   | No       | Field description                          |
| `inlineHelpText`      | string   | No       | Help text                                  |
| `required`            | bool     | No       | Required field                             |
| `trackHistory`        | bool     | No       | Track history                              |
| `trackTrending`       | bool     | No       | Track trending                             |
| `length`              | number   | No       | Max length (Text/EncryptedText)            |
| `externalId`          | bool     | No       | External ID                                |
| `unique`              | bool     | No       | Unique                                     |
| `visibleLines`        | number   | No       | Lines visible (LongTextArea/Html)          |
| `precision`           | number   | No       | Precision (Number/Currency/Percent)      |
| `scale`               | number   | No       | Scale (Number/Currency/Percent)           |
| `displayLocationInDecimal` | bool | No       | Decimal location display (Location)       |
| `defaultValue`        | bool     | No       | Default for Checkbox                       |
| `displayFormat`       | string   | No       | AutoNumber format                          |
| `referenceTo`         | string   | No       | Lookup/MasterDetail target                 |
| `relationshipName`    | string   | No       | Relationship API name                       |
| `relationshipLabel`   | string   | No       | Label for relationship                    |
| `deleteConstraint`    | string   | No       | `SetNull`, `Restrict`, `Cascade`           |
| `relationshipOrder`   | number   | No       | MasterDetail order                        |
| `reparentableMasterDetail` | bool | No       | Reparentable MD                           |
| `writeRequiresMasterRead` | bool  | No       | Write requires master read                 |
| `valueSet`            | object   | No       | Picklist value set (Picklist types)        |
| `formula`             | string   | No       | Formula expression (Formula)               |
| `formulaTreatBlanksAs`| string   | No       | `BlankAsZero` or `BlankAsBlank`          |
| `returnType`          | string   | No       | `Text`, `Number`, `Currency`, etc.      |
| `summaryForeignKey`   | string   | No       | Summary relationship key                  |
| `summaryOperation`    | string   | No       | `COUNT`, `SUM`, `MIN`, `MAX`             |
| `summarizedField`     | string   | No       | Field to summarize                        |

### Field Types

`Text`, `TextArea`, `LongTextArea`, `Html`, `EncryptedText`, `Number`, `Currency`, `Percent`, `Location`, `Checkbox`, `Date`, `DateTime`, `Time`, `Email`, `Phone`, `Url`, `AutoNumber`, `Lookup`, `MasterDetail`, `Picklist`, `MultiselectPicklist`, `Formula`, `Summary`

### Response

**Success — 200 OK**

```json
{
  "status": true,
  "error": null,
  "createdItems": [
    {
      "name": "Description__c",
      "type": "CustomField",
      "path": "/app/projects/my-project-01/force-app/objects/MyObject__c/fields/Description__c.field-meta.xml"
    }
  ]
}
```

**Validation Error — 500**

```json
{
  "status": false,
  "error": "Field creation failed: field fullName is required",
  "createdItems": []
}
```

---

## GET /metadata/objects

Lists all custom objects in the project.

### Headers

Requires all auth headers.

### Response

**Success — 200 OK**

```json
{
  "status": true,
  "error": null,
  "createdItems": [
    {
      "name": "MyObject__c",
      "type": "CustomObject",
      "path": "/app/projects/my-project-01/force-app/objects/MyObject__c/MyObject__c.object-meta.xml"
    }
  ]
}
```

---

## GET /metadata/objects/:apiName

Retrieves a specific custom object by API name, including its XML and child fields.

### Headers

Requires all auth headers.

### URL Parameters

| Param    | Description                         |
| -------- | ----------------------------------- |
| apiName  | API name of the object (e.g. `MyObject__c`) |

### Response

**Success — 200 OK**

```json
{
  "status": true,
  "error": null,
  "createdItems": [
    {
      "name": "MyObject__c",
      "type": "CustomObject",
      "path": "/app/projects/my-project-01/force-app/objects/MyObject__c/MyObject__c.object-meta.xml"
    }
  ],
  "detail": {
    "apiName": "MyObject__c",
    "xml": "<?xml version=...",
    "fields": ["Description__c", "Amount__c"]
  }
}
```

**Not Found — 404**

```json
{
  "status": false,
  "error": "Custom object 'NonExistent__c' not found in project 'my-project-01'",
  "createdItems": []
}
```

---

## PUT /metadata/objects/:apiName

Updates an existing custom object by overwriting its XML and redeploying to the org.

### Headers

Requires all auth headers listed above.

### URL Parameters

| Param | Description |
| -------- | ----------------------------------- |
| apiName | API name of the object to update (e.g. `MyObject__c`) |

### Request Body

Same shape as `POST /metadata/objects`. The `fullName` in the body must match the `:apiName` URL parameter.

```json
{
  "fullName": "MyObject__c",
  "label": "My Object",
  "pluralLabel": "My Objects",
  "deploymentStatus": "Deployed",
  "sharingModel": "ReadWrite",
  "visibility": "Public",
  "nameField": {
    "label": "My Object Name",
    "type": "Text"
  }
}
```

### Response

**Success — 200 OK**

```json
{
  "success": true,
  "error": null,
  "components": [
    {
      "fullName": "MyObject__c",
      "type": "CustomObject",
      "xml": "<?xml version=..."
    }
  ]
}
```

**Not Found — 404**

```json
{
  "status": false,
  "error": "Custom object 'MyObject__c' not found in project 'my-project-01'",
  "components": []
}
```

**Mismatch — 400**

```json
{
  "status": false,
  "error": "fullName in body ('Other__c') must match URL param ('MyObject__c')",
  "components": []
}
```

---

## PUT /metadata/fields/:objectName/:fieldName

Updates an existing custom field by overwriting its XML and redeploying to the org.

### Headers

Requires all auth headers listed above.

### URL Parameters

| Param | Description |
| ----------- | ----------------------------------- |
| objectName | API name of the parent object (e.g. `MyObject__c`) |
| fieldName | API name of the field to update (e.g. `Description__c`) |

### Request Body

Same shape as the `field` object in `POST /metadata/fields`. The `fullName` in the field spec must match the `:fieldName` URL parameter.

```json
{
  "field": {
    "fullName": "Description__c",
    "label": "Description",
    "type": "Text",
    "length": 500,
    "required": false
  }
}
```

### Response

**Success — 200 OK**

```json
{
  "success": true,
  "error": null,
  "components": [
    {
      "fullName": "Description__c",
      "type": "CustomField",
      "xml": "<?xml version=..."
    }
  ]
}
```

**Not Found — 404**

```json
{
  "status": false,
  "error": "Custom field 'Description__c' not found on object 'MyObject__c' in project 'my-project-01'",
  "components": []
}
```

---

## DELETE /metadata/objects/:apiName

Deletes a custom object from the Salesforce org and removes its local files. The server first retrieves the latest metadata from the org to ensure local state is in sync, then executes `sf project delete source --metadata CustomObject:<apiName>` against the org.

### Headers

Requires all auth headers listed above.

### URL Parameters

| Param | Description |
| -------- | ----------------------------------- |
| apiName | API name of the object to delete (e.g. `MyObject__c`) |

### Response

**Success — 200 OK**

```json
{
  "success": true,
  "error": null,
  "components": [
    {
      "fullName": "MyObject__c",
      "type": "CustomObject"
    }
  ]
}
```

**Not Found — 404**

```json
{
  "status": false,
  "error": "Custom object 'MyObject__c' not found in project 'my-project-01'",
  "components": []
}
```

**Org Delete Failed — 500**

```json
{
  "status": false,
  "error": "Delete from org failed: <SFDX error message>",
  "components": []
}
```

---

## DELETE /metadata/fields/:objectName/:fieldName

Deletes a custom field from the Salesforce org and removes its local file. The server first retrieves the latest metadata from the org to ensure local state is in sync, then executes `sf project delete source --metadata CustomField:<objectName>.<fieldName>` against the org.

### Headers

Requires all auth headers listed above.

### URL Parameters

| Param | Description |
| ----------- | ----------------------------------- |
| objectName | API name of the parent object (e.g. `MyObject__c`) |
| fieldName | API name of the field to delete (e.g. `Description__c`) |

### Response

**Success — 200 OK**

```json
{
  "success": true,
  "error": null,
  "components": [
    {
      "fullName": "Description__c",
      "type": "CustomField"
    }
  ]
}
```

**Not Found — 404**

```json
{
  "status": false,
  "error": "Custom field 'Description__c' not found on object 'MyObject__c' in project 'my-project-01'",
  "components": []
}
```

**Org Delete Failed — 500**

```json
{
  "status": false,
  "error": "Delete from org failed: <SFDX error message>",
  "components": []
}
```

---

## Error Response Format

All error responses follow this structure:

```json
{
  "status": false,
  "error": "Human-readable error message",
  "createdItems": []
}
```

| Status | Meaning                                      |
| ------ | -------------------------------------------- |
| 400    | Missing required headers (`x-project-id`, etc.) |
| 401    | Invalid or missing `x-api-key`               |
| 404    | Resource not found                           |
| 500    | Internal / validation / SFDX error           |
