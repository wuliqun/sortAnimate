<template>
  <div id="app">
    <div class="left">
      <div class="gene">
        <span class="label">数组长度:</span>
        <div class="input-wrapper">
          <el-slider v-model="length" :min="1" :max="50" show-input></el-slider>
        </div>
        <el-button @click="generateRandomArray">生成随机数组</el-button>
      </div>
      <div class="arr">
        <div class="label">数组:</div>
        <div class="textarea">
          <el-input type="textarea" :rows="2" placeholder="键入数组" v-model="arrString"></el-input>
        </div>
      </div>
      <div class="method">
        <div class="label">算法选择:</div>
        <div class="btns">
          <div class="btn-wrapper" v-for="(method,index) in sortMethods" :key="method.id">
            <el-button type="primary" :plain="index !== methodIndex" :disabled="index > 6" @click="methodIndex = index">{{ method.name }}</el-button>
          </div>
        </div>
      </div>
      <div class="commit">
        <div class="label">操作:</div>
        <div class="btn-wrapper">
          <el-button type="success" round @click="startSort">开始排序</el-button>
          <el-button type="warning" round @click="reset">重置</el-button>
        </div>
      </div>
      <div class="speed">
        <div class="label">速度:</div>
        <el-slider v-model="delay" :min="0" :max="500"></el-slider>
      </div>
    </div>
    <div class="right">
      <in-place-component :arr="arr" :delay="delay" v-if="isInPlaceMethod" ref="inplaceComponent"></in-place-component>
      <merge-component :arr="arr" :delay="delay" v-if="methodIndex === 4" ref="mergeComponent"></merge-component>
    </div>
  </div>
</template>

<script>
import "./style/reset.css";
import sortMixin from "./mixin/sortMixin";
import InPlaceComponent from './components/inPlaceSort';
import MergeComponent from './components/mergeSort';
const inPlaceSort = ['bubbleSort','selectSort','insertSort','shellSort','quickSort','heapSort'];
export default {
  name: "App",
  created() {
    this.generateRandomArray();
  },
  mounted() {
    window.vm = this;
  },
  data() {
    return {
      length: 15,
      arr: [],
      sortArr: [],
      max: 0,
      arrString: "",
      sortMethods: [
        {
          id: 1,
          name: "冒泡排序",
          funcName: "bubbleSort"
        },
        {
          id: 2,
          name: "选择排序",
          funcName: "selectSort"
        },
        {
          id: 3,
          name: "插入排序",
          funcName: "insertSort"
        },
        {
          id: 4,
          name: "希尔排序",
          funcName: "shellSort"
        },
        {
          id: 5,
          name: "归并排序",
          funcName: "mergeSort"
        },
        {
          id: 6,
          name: "快速排序",
          funcName: "quickSort"
        },
        {
          id: 7,
          name: "堆排序",
          funcName: "heapSort"
        },
        {
          id: 8,
          name: "桶排序",
          funcName: "bucketSort"
        },
        {
          id: 9,
          name: "计数排序",
          funcName: "countingSort"
        },
        {
          id: 10,
          name: "基数排序",
          funcName: "radixSort"
        }
      ],
      methodIndex: 0, // 当前排序方法名
      delay: 300, //动画间隔
      show:false,
      message:'',
      current:null
    };
  },
  components: {
    InPlaceComponent,
    MergeComponent
  },
  methods: {
    generateRandomArray() {
      let arr = [],
        len = this.length,
        i;
      for (i = 0; i < len; i++) {
        arr[i] = Math.ceil(Math.random() * 100);
      }
      this.arr = arr;
      this.arrString = `[${arr.join(", ")}]`;
      // this.sortArr = this.wrapArr(arr);
      // this.max = Math.max.apply(null, arr);
      // this.arrString = `[${arr.join(", ")}]`;
      // this.stop = false;
    },
    reset() {
      this.current.stopSort();
    },
    startSort() {
      let funcName = this.sortMethods[this.methodIndex].funcName;
      if(inPlaceSort.indexOf(funcName) !== -1){
        this.current = this.$refs.inplaceComponent;
      }else if(funcName === 'mergeSort'){
        this.current = this.$refs.mergeComponent;        
      }
      this.current.startSort(funcName);
    }
  },
  computed:{
    isInPlaceMethod(){
      return inPlaceSort.indexOf(this.sortMethods[this.methodIndex].funcName) !== -1;
    }
  }
};
</script>

<style lang="scss" scoped>
#app {
  display: flex;
  padding: 20px;
  .left {
    width: 600px;
    flex-grow: 1;
    margin-right: 45px;
  }
  .right {
    width: 600px;
    flex-grow: 2;
    padding-left: 50px;
  }
}
.label {
  line-height: 40px;
  padding-right: 25px;
  font-size: 14px;
}
.gene {
  display: flex;
  align-items: center;
  .input-wrapper {
    flex-grow: 1;
    padding-right: 30px;
  }
}
.arr {
  margin-top: 30px;
  .textarea {
    width: 500px;
    margin-left: 30px;
  }
}
.method {
  margin-top: 30px;
  .btns {
    display: flex;
    flex-wrap: wrap;
    margin-left: 30px;
  }
  .btn-wrapper {
    margin: 0 25px 15px 0;
  }
}
.commit {
  margin-top: 30px;
  .btn-wrapper {
    margin-left: 30px;
  }
}
.speed {
  margin-top: 30px;
}
</style>
