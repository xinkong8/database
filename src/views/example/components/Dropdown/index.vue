<template>
  <div class="dropdown-container">
    <CommentDropdown v-model="comment_disabled" />
    <PlatformDropdown v-model="platforms" />
    <SourceUrlDropdown v-model="source_uri" />
  </div>
</template>

<script>
import CommentDropdown from './CommentDropdown'
import PlatformDropdown from './PlatformDropdown'
import SourceUrlDropdown from './SourceUrlDropdown'

export default {
  name: 'Dropdown',
  components: {
    CommentDropdown,
    PlatformDropdown,
    SourceUrlDropdown
  },
  data() {
    return {
      comment_disabled: false,
      platforms: ['a-platform'],
      source_uri: ''
    }
  }
}
</script>
