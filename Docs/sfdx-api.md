# SFDX Server API

SFDX Server is a stateless Docker service that executes Salesforce CLI operations on behalf of the Metaforce platform. It manages SFDX project directories, creates and deploys metadata (custom objects and fields), and syncs metadata from connected orgs. Base URL: `http://localhost:8000`.

---

## Authentication

All endpoints except `GET /health` require the following headers:

| Header | Description | Example |
|---|---|---|
| `x-api-key` | API key configured in server `.env` | `dev-api-key` |
| `x-project-id` | Project ID used to scope SFDX project files | `my-project-01` |
| `x-access-token` | Salesforce org access token | `00D...` |
| `x-org-url` | Salesforce org instance URL | `https://myorg.my.salesforce.com` |

---

## Endpoints

### GET /health

Health check. Returns server status and timestamp.

**Request** — No auth required.

**Response**

```json
{
  "status": "ok",
  "timestamp": "2026-05-18T12:00:00.000Z"
}
```

---

### POST /metadata/project-setup

Initializes the SFDX project directory for a project and authenticates with the Salesforce org. If the project directory already exists, re-authenticates with the org instead.

**Request** — Requires auth. No request body.

**Response**

```json
{
  "success": true,
  "error": null,
  "components": []
}
```

---

### POST /metadata/fetch-latest

Ensures the project is set up (lazy init), then retrieves the latest metadata from the connected org using `sf project retrieve start` and syncs the local project directory.

**Request** — Requires auth. No request body.

**Response**

```json
{
  "success": true,
  "error": null,
  "components": []
}
```

---

### GET /metadata/objects

Lists all custom objects in the project directory. Returns the XML content for each object.

**Request** — Requires auth. No request body.

**Response**

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

---

### POST /metadata/objects

Creates a custom object, writes its XML to the project directory, and deploys it to the org.

**Request** — Requires auth.

| Field | Type | Required | Description |
|---|---|---|---|
| `fullName` | string | Yes | API name. Must end in `__c` |
| `label` | string | Yes | Singular display label |
| `pluralLabel` | string | Yes | Plural display label |
| `description` | string | No | Object description |
| `deploymentStatus` | enum | No | See **Deployment Status**. Defaults to `Deployed` |
| `sharingModel` | enum | Yes | See **Sharing Model** |
| `externalSharingModel` | string | No | External sharing model |
| `visibility` | enum | Yes | See **Visibility** |
| `nameField` | object | Yes | See **Name Field Spec** |
| `allowInChatterGroups` | boolean | No | Allow in Chatter groups |
| `enableActivities` | boolean | No | Enable activities |
| `enableBulkApi` | boolean | No | Enable Bulk API |
| `enableFeeds` | boolean | No | Enable feeds |
| `enableHistory` | boolean | No | Enable history |
| `enableReports` | boolean | No | Enable reports |
| `enableSearch` | boolean | No | Enable search |
| `enableSharing` | boolean | No | Enable sharing |
| `enableStreamingApi` | boolean | No | Enable Streaming API |
| `compactLayoutAssignment` | string | No | Compact layout assignment |

**Response**

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

---

### GET /metadata/objects/:apiName

Retrieves a specific custom object by API name, including its XML and all child field definitions.

**Request** — Requires auth.

| Param | Description |
|---|---|
| `apiName` | API name of the object (e.g. `MyObject__c`) |

**Response**

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
  ],
  "detail": {
    "apiName": "MyObject__c",
    "xml": "<?xml version=...",
    "fields": [
      {
        "fullName": "Description__c",
        "type": "CustomField",
        "xml": "<?xml version=..."
      }
    ]
  }
}
```

---

### PUT /metadata/objects/:apiName

Updates an existing custom object by overwriting its XML and redeploying to the org. The `fullName` in the body must match the `:apiName` URL param.

**Request** — Requires auth.

| Param | Description |
|---|---|
| `apiName` | API name of the object to update (e.g. `MyObject__c`) |

Request body is the same shape as `POST /metadata/objects`.

**Response**

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

---

### DELETE /metadata/objects/:apiName

Deletes a custom object from the Salesforce org and removes its local project directory.

**Request** — Requires auth.

| Param | Description |
|---|---|
| `apiName` | API name of the object to delete (e.g. `MyObject__c`) |

**Response**

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

---

### POST /metadata/fields

Creates a custom field on an existing object, writes its XML, and deploys it to the org.

**Request** — Requires auth.

| Field | Type | Required | Description |
|---|---|---|---|
| `objectName` | string | Yes | Parent object API name (e.g. `MyObject__c`) |
| `field` | object | Yes | See **Field Spec** |

**Response**

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

---

### PUT /metadata/fields/:objectName/:fieldName

Updates an existing custom field by overwriting its XML and redeploying to the org. The `fullName` in the field spec must match the `:fieldName` URL param.

**Request** — Requires auth.

| Param | Description |
|---|---|
| `objectName` | Parent object API name (e.g. `MyObject__c`) |
| `fieldName` | API name of the field to update (e.g. `Description__c`) |

Request body shape:

| Field | Type | Required | Description |
|---|---|---|---|
| `field` | object | Yes | See **Field Spec** |

**Response**

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

---

### DELETE /metadata/fields/:objectName/:fieldName

Deletes a custom field from the Salesforce org and removes its local XML file.

**Request** — Requires auth.

| Param | Description |
|---|---|
| `objectName` | Parent object API name (e.g. `MyObject__c`) |
| `fieldName` | API name of the field to delete (e.g. `Description__c`) |

**Response**

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

---

## Name Field Spec

Used in custom object creation (`nameField` in request body).

| Field | Type | Required | Description |
|---|---|---|---|
| `label` | string | Yes | Display label |
| `type` | enum | Yes | `Text` or `AutoNumber` |
| `displayFormat` | string | No | Required when type is `AutoNumber` |
| `scale` | number | No | Scale for numeric types |
| `trackHistory` | boolean | No | Track field history |

---

## Field Spec

All field types share a base set of properties, plus type-specific fields.

### Base Fields

All field specs include these:

| Field | Type | Required | Description |
|---|---|---|---|
| `fullName` | string | Yes | API name. Must end in `__c` |
| `label` | string | Yes | Display label |
| `type` | enum | Yes | See **Field Types** |
| `description` | string | No | Field description |
| `inlineHelpText` | string | No | Help text shown inline |
| `required` | boolean | No | Whether the field is required |
| `trackHistory` | boolean | No | Track field history |
| `trackTrending` | boolean | No | Track trending |

### Type-Specific Fields

| Field | Type | Applies to | Required for | Description |
|---|---|---|---|---|
| `length` | number | Text, LongTextArea, Html, EncryptedText | EncryptedText | Max character length |
| `externalId` | boolean | Text, Number, Email, AutoNumber, EncryptedText | — | Mark as external ID |
| `unique` | boolean | Text, Number, Email | — | Enforce uniqueness |
| `visibleLines` | number | LongTextArea, Html, MultiselectPicklist | LongTextArea, Html | Lines visible in UI |
| `maskChar` | enum | EncryptedText | EncryptedText | `asterisk` or `X` |
| `maskType` | enum | EncryptedText | EncryptedText | See **Mask Types** |
| `precision` | number | Number, Currency, Percent, Formula | Number, Currency, Percent | Total digit count |
| `scale` | number | Number, Currency, Percent, Location, Formula | Number, Currency, Percent | Decimal digit count |
| `displayLocationInDecimal` | boolean | Location | — | Show location in decimal |
| `defaultValue` | boolean | Checkbox | — | Default checked state |
| `displayFormat` | string | AutoNumber | AutoNumber | Auto-number format string |
| `referenceTo` | string | Lookup, MasterDetail | Lookup, MasterDetail | Target object API name |
| `relationshipName` | string | Lookup, MasterDetail | Lookup, MasterDetail | Relationship API name |
| `relationshipLabel` | string | Lookup, MasterDetail | Lookup, MasterDetail | Relationship display label |
| `deleteConstraint` | enum | Lookup | — | `SetNull`, `Restrict`, or `Cascade` |
| `relationshipOrder` | number | MasterDetail | MasterDetail | Order in master-detail |
| `reparentableMasterDetail` | boolean | MasterDetail | — | Allow reparenting |
| `writeRequiresMasterRead` | boolean | MasterDetail | — | Write requires master read |
| `valueSet` | object | Picklist, MultiselectPicklist | Picklist, MultiselectPicklist | See **Value Set** |
| `formula` | string | Formula | Formula | Formula expression |
| `formulaTreatBlanksAs` | enum | Formula | — | `BlankAsZero` or `BlankAsBlank` |
| `returnType` | enum | Formula | Formula | See **Formula Return Types** |
| `summaryForeignKey` | string | Summary | Summary | Summary relationship key |
| `summaryOperation` | enum | Summary | Summary | See **Summary Operations** |
| `summarizedField` | string | Summary | Required when operation is not `COUNT` | Field to summarize |

### Value Set

Used by Picklist and MultiselectPicklist fields.

| Field | Type | Required | Description |
|---|---|---|---|
| `restricted` | boolean | No | Restrict values to the defined set |
| `sorted` | boolean | No | Sort values alphabetically |
| `values` | array | Yes | Array of **Picklist Value** objects |

### Picklist Value

| Field | Type | Required | Description |
|---|---|---|---|
| `fullName` | string | Yes | API name of the value |
| `label` | string | Yes | Display label |
| `default` | boolean | No | Whether this is the default value |

---

## Field Types

| Type | Category |
|---|---|
| `Text` | Text |
| `TextArea` | Text |
| `LongTextArea` | Text |
| `Html` | Text |
| `EncryptedText` | Text |
| `Number` | Numeric |
| `Currency` | Numeric |
| `Percent` | Numeric |
| `Location` | Numeric |
| `Checkbox` | Boolean |
| `Date` | Date/Time |
| `DateTime` | Date/Time |
| `Time` | Date/Time |
| `Email` | Communication |
| `Phone` | Communication |
| `Url` | Communication |
| `AutoNumber` | AutoNumber |
| `Lookup` | Relationship |
| `MasterDetail` | Relationship |
| `Picklist` | Picklist |
| `MultiselectPicklist` | Picklist |
| `Formula` | Formula |
| `Summary` | Rollup Summary |

## Deployment Status

`Deployed` | `InDevelopment`

## Sharing Model

`ReadWrite` | `Private` | `ControlledByParent`

## Visibility

`Public` | `PackageProtected`

## Mask Types

`all` | `lastFour` | `creditCard` | `sin` | `socialSecurityNumber` | `nino`

## Formula Return Types

`Text` | `Number` | `Currency` | `Percent` | `Date` | `DateTime` | `Checkbox`

## Summary Operations

`COUNT` | `SUM` | `MIN` | `MAX`

---

## Error Reference

All error responses follow this structure:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "components": []
}
```

| Status | Meaning |
|---|---|
| 400 | Missing or invalid request data (missing headers, body field, or param mismatch) |
| 401 | Missing or invalid `x-api-key` |
| 404 | Resource not found (object or field does not exist in project) |
| 500 | Internal error (project setup failure, validation failure, SFDX deploy/retrieve/delete failure) |
