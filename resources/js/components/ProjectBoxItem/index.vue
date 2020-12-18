<template>
  <div class="project-box__container">
    <template v-if="role === 'Student'">
      <ProjectBoxItemWaiting v-if="data.status === 'Waiting'" :data="data" />
      <ProjectBoxItemAccepted v-else-if="data.status === 'Accepted'" :data="data" />
      <ProjectBoxItemRejected v-else-if="data.status === 'Rejected'" :data="data" />
      <ProjectBoxItemWaitingToStart v-else-if="data.status === 'Waiting to Start'" :data="data" />
      <ProjectBoxItemProjectStarted v-else-if="data.status === 'Project Started'" :data="data" />
      <ProjectBoxItemFinished v-else-if="data.status === 'Finished'" :data="data" />
      <ProjectBoxItemBailOut v-else-if="data.status === 'Bail Out'" :data="data" />
    </template>
    <template v-else>
      <ProjectBoxItemHiring v-if="data.status === 'Hiring'" :data="data" />
      <ProjectBoxItemOngoing v-else-if="data.status === 'Ongoing'" :data="data" />
      <ProjectBoxItemConfirmation v-else-if="data.status === 'Confirmation'" :data="data" />
      <ProjectBoxItemFinished v-else-if="data.status === 'Finished'" :data="data" />
      <ProjectBoxItemDraft v-else-if="data.status === 'Draft'" :data="data" />
    </template>
  </div>
</template>

<script>
import ProjectBoxItemWaiting from '~/components/ProjectBoxItem/Student/ProjectBoxItemWaiting'
import ProjectBoxItemAccepted from '~/components/ProjectBoxItem/Student/ProjectBoxItemAccepted'
import ProjectBoxItemRejected from '~/components/ProjectBoxItem/Student/ProjectBoxItemRejected'
import ProjectBoxItemWaitingToStart from '~/components/ProjectBoxItem/Student/ProjectBoxItemWaitingToStart'
import ProjectBoxItemProjectStarted from '~/components/ProjectBoxItem/Student/ProjectBoxItemProjectStarted'
import ProjectBoxItemBailOut from '~/components/ProjectBoxItem/Student/ProjectBoxItemBailOut'
import ProjectBoxItemHiring from '~/components/ProjectBoxItem/Lecturer/ProjectBoxItemHiring'
import ProjectBoxItemOngoing from '~/components/ProjectBoxItem/Lecturer/ProjectBoxItemOngoing'
import ProjectBoxItemConfirmation from '~/components/ProjectBoxItem/Lecturer/ProjectBoxItemConfirmation'
import ProjectBoxItemFinished from '~/components/ProjectBoxItem/Lecturer/ProjectBoxItemFinished'
import ProjectBoxItemDraft from '~/components/ProjectBoxItem/Lecturer/ProjectBoxItemDraft'

export default {
  name: 'ProjectBoxItem',

  middleware: ['auth'],

  components: {
    ProjectBoxItemWaiting,
    ProjectBoxItemAccepted,
    ProjectBoxItemRejected,
    ProjectBoxItemWaitingToStart,
    ProjectBoxItemProjectStarted,
    ProjectBoxItemBailOut,
    ProjectBoxItemHiring,
    ProjectBoxItemOngoing,
    ProjectBoxItemConfirmation,
    ProjectBoxItemFinished,
    ProjectBoxItemDraft
  },

  props: {
    data: { type: Object, default: null },
    role: { type: String, default: null }
  }
}
</script>

<style scoped>

</style>
