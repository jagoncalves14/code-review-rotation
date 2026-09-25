# ✅ APP TO DO LIST: Pages & Features

## 1. **Users List Page** (Admin Only)

Displays a table of all registered users.

### 🔧 Features:
- **User name**
- **Email**
- **Admin badge** (if applicable)
- **Edit** button
- **Change password** action

### ✅ Actions:
- Search/filter by name or email
- Pagination (if many users)

---

## 2. **User Edit Page** (Admin Only)

Admin panel to manage an individual user’s access level and permissions.

### 🔧 Fields:
- `Name`
- `Is Admin` (checkbox)
- `Permissions`: multiselect or radio for:
  - `View only`
  - `View & Edit`
- `Reset Password` (with optional email link trigger)

---

## 3. **Account Settings Page** (Accessible by logged-in users)

User-facing profile settings page.

### 🔧 Fields:
- `Name` (editable)
- `Change Password`
- Admin banner if user is admin:
  > 🔒 You are an admin and can manage other users and projects.

---

## 4. **Project Creation Page**

Create a new rotation project.

### 🔧 Fields:
- **Project Name** (text)
- **Rotation Duration** (default: `15 days`, number input)
- **Start Day of Rotation** (date picker)
- **Number of Reviewers to Assign** (default to 2)
- **Assignees** (select from list of Profiles)
- **Reviewers** (select from list of Profiles)
- **Project State**: dropdown
  - `Draft`
  - `Active`
  - `Inactive`

### 🧠 Notes:
- Assignees can later be configured with fixed reviewers and individual reviewer counts.

---

## 5. **Project Settings Edit Page**

Update the configuration of an existing project.

### 🔧 Editable:
- Project Name
- Rotation Time Period
- Start Day of Rotation
- Number of Reviewers
- Assignees
- Reviewers
- Project State

### ❗ Actions:
- **Delete Project** (with confirmation)
- **Save Changes** (instantly applied if project is `Active`)
- Admin-only access to delete or change from `Inactive` to `Active`

---

## 6. **Home Page (Dashboard)**

Landing page with list of all projects and high-level information.

### 🔍 Filter Bar:
- **Search Input** for project names
- Future: status filter (Active / Inactive / Draft)

### 📋 Project List:
- Card or table layout for each project
- Display:
  - Project Name
  - Status
  - Last rotation date
  - Button: “View Project”
  - Inline preview: table of current active rotation

---

## 7. **Project Detail Page**

In-depth view of an individual project with ability to inspect and manage rotations.
It shows the current and past rotations. Past rotations are shown one at the time, with a select filter to choose which rotation to show.

### 📋 Main Content:
- **Rotation Table**
  - Rows: Assignees
  - Columns: Assigned reviewers
  - The reviewers column is editable. Clicking on it, transforms the content into a BaseCombobox, where the user can select more reviewers and remove existing ones.
- **Action Buttons:**
  - “Trigger New Rotation" button (manual)
  - “Edit Settings" button (active mode only)
  - "Save" button
  - "Back to Projects" button

### 🧠 Notes:
- Should include validation if fixed reviewers are unavailable.
- Save is disabled and greyed out if no changes were made.
- Option to preview upcoming rotation.

---

## 🔒 Authentication & Authorization

Ensure:
- Only admins can:
  - Access user management
  - Create/edit/delete projects
- All authenticated users can:
  - View their profile
  - View assigned projects (with View permission)
  - Edit assigned projects (with Edit permission)

---

## 🔁 Rotations & State Logic

- Rotations are auto-generated every `[rotation_duration]` days
- **Manual rotation** is possible via button
- Rotation **history** is displayed and archived per project
- If a project is `Active`, any edit **takes immediate effect**
- `Draft` projects are ignored by the rotation engine

---

## 🛠 Additional Suggestions

### 💬 Notifications
- Toasts or alerts for:
  - Rotation successfully triggered
  - Project saved
  - Errors (e.g. reviewer unavailable)

### 📱 Mobile Responsiveness
- Project tables should stack or scroll gracefully on mobile

### 📂 Import/Export
- Optional: export rotation history as CSV

### 🧪 Testing Strategy
- Role-based access tests
- Rotation edge cases (insufficient reviewers, missing fixed reviewer, etc.)
- Integration with Supabase triggers (mock or real)
