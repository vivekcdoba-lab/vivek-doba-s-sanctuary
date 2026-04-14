

## Plan: Add "Your Wheel of Life" Widget to Seeker Dashboard

### New Component
**`src/components/dashboard/WheelOfLifeWidget.tsx`**
- A compact dashboard card that uses `useWheelOfLife()` to fetch the latest assessment
- Shows a mini radar chart (Recharts `RadarChart`) with the 8 life dimensions if data exists
- Shows average score and date of last assessment
- Empty state: prompt to take first assessment with link to `/seeker/assessments/wheel-of-life`
- "View Details →" link to the full Wheel of Life assessment page

### Modified File
**`src/pages/seeker/SeekerHome.tsx`**
- Import `WheelOfLifeWidget`
- Add it in the grid row alongside `LGTBalanceWheel` and `UpcomingSessionsWidget`, creating a new row:
  ```
  LGTBalanceWheel | WheelOfLifeWidget
  UpcomingSessionsWidget | Artha Health
  ```

### No Database Changes
The widget reads from the existing `wheel_of_life_assessments` table via `useWheelOfLife()`.

