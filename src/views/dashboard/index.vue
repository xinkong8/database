<template>
  <div class="dashboard-container">
    <life-overview />
  </div>
</template>

<script>
import LifeOverview from './life-overview'

export default {
  name: 'Dashboard',
  components: { LifeOverview }
}
</script>
