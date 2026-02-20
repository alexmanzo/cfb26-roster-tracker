<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
import RosterTable from './components/RosterTable.vue';
import { useRosterStore } from './composables/useRosterStore';

const { resetToDefaults } = useRosterStore();

function handleReset() {
  if (confirm('Reset all roster data to defaults? This cannot be undone.')) {
    resetToDefaults();
  }
}
</script>

<template>
  <div class="min-h-screen bg-zinc-950 text-zinc-100">
    <AppHeader @reset="handleReset" />
    <main class="max-w-screen-2xl mx-auto">
      <RosterTable />
    </main>
  </div>
</template>
