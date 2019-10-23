<template>
  <div id="app">
    <div class="gene">
      <span class="label">数组长度:</span>
      <input type="text" v-model="length" class="len">
      <button class="btn" @click="generateRandomArray">生成随机数组</button>
    </div>
  </div>
</template>

<script>
import sortMixin from './mixin/sortMixin';
export default {
  mixins:[sortMixin],
  name: 'App',
  created(){
    let method  = 'radixSort';
    let arr = [5,54,44,54365,3,54,41,33,5,65,9,6,2,5,6,66,55];
    this[method](arr);
    console.log(arr);
  },
  data(){
    return {
      length:10,
      arr:[]
    }
  },
  components: {
  },
  methods:{
    generateRandomArray(){
      let arr = [],len = this.length,i;
      for(i=0;i<len;i++){
        arr[i] = Math.ceil(Math.random()*100);
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
