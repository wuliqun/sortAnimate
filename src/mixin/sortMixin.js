export default {
  methods: {
    // 交换数组元素
    swap(arr, i, j) {
      if (i !== j) {
        let tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
      }
    },
    // 冒泡
    bubbleSort: function *(arr) {
      let len = arr.length,
        i, j;
      for (i = 0; i < len; i++) {
        for (j = 1; j < len - i; j++) {
          yield ['active',[j-1,j]];
          if (arr[j] < arr[j - 1]) {
            this.swap(arr, j, j - 1);
            yield ['swap',[j-1,j]];
          }else{
            yield ['deactive',[j-1,j]];
          }
        }
        yield ['sorted',[len-i-1]];
      }
      return arr;
    },
    // 选择
    selectSort: function *(arr) {
      let len = arr.length,
        i, j, minIndex, min;
      for (i = 0; i < len; i++) {
        min = arr[i];
        minIndex = i;
        yield ['active',[i]];
        for (j = i + 1; j < len; j++) {
          yield ['active',[j]];
          if (min > arr[j]) {
            yield ['deactive',[minIndex]];
            yield ['active',[j]];
            min = arr[j];
            minIndex = j;
          }else{
            yield ['deactive',[j]];
          }
        }
        if(i !== minIndex){
          this.swap(arr, i, minIndex);
          yield ['swap',[i,minIndex]];
        }else{
          yield ['deactive',[i]];
        }
        yield ['sorted',[i]];
      }
      return arr;
    },
    // 插入
    insertSort: function *(arr) {
      let len = arr.length,
        i, j, cur;
      for (i = 1; i < len; i++) {
        yield ['down',[i]];
        cur = arr[i];
        j = i - 1;
        yield('active',[j]);
        while (j >= 0 && arr[j] > cur) {
          arr[j + 1] = arr[j];
          yield('active',[j]);
          yield ['swap',[j,j+1]];
          j--;
        }
        yield('deactive',[j]);
        arr[j + 1] = cur;
        yield ['up',[j + 1]];
        yield ['sorted',new Array(i+1).fill('').map((item,index)=>index)];
      }
      return arr;
    },
    // 希尔
    shellSort: function * (arr) {
      let len = arr.length,
        gap = len,
        i,
        j,
        cur,
        tmp;
      while (gap > 1) {
        gap = gap >> 1;        
        yield ['show', `gap = ${gap}`];
        for (i = gap; i < len; i++) {
          tmp = [];
          // 当前子数组
          for(j = i;j >= 0;j-=gap){
            tmp.push(j);            
          }
          if(gap === 1){
            yield ['sorted',tmp];
          }else{
            yield ['shell',tmp];
          }
          cur = arr[i];
          yield ['down',[i]];
          j = i - gap;
          yield ['active',[j]];
          while (j >= 0 && arr[j] > cur) {
            yield ['active',[j]];
            yield ['swap',[j,j+gap]];
            arr[j + gap] = arr[j];
            j -= gap;
          }
          if(j >= 0){
            yield ['deactive',[j]];
          }
          arr[j + gap] = cur;
          yield ['up',[j+gap]];
          if(gap !== 1){
            yield ['unshell',tmp];
          }
        }
      }
      yield ['unshow'];
      return arr;
    },
    // 归并
    mergeSort(arr) {
      let len = arr.length,
        step = 2,
        i;
      // 申请空间
      let tmp = [];
      for (step = 2; step < len * 2; step *= 2) {
        for (i = 0; i < len; i += step) {
          this.merge(arr, i, step, tmp);
        }
      }
      return arr;
    },
    // 归并 辅助函数
    merge(arr, index, step, tmp) {
      // 当前可用长度
      let len = Math.min(arr.length - index, step) + index;
      // 将当前数组分为左右两边,mid是右边数组的起始下标
      let mid = index + step / 2;
      // 仅当存在右边数组时,才需要合并
      if (mid < len) {
        let i = index,
          j = mid,
          k = 0;
        while (i < mid && j < len) {
          if (arr[i] <= arr[j]) {
            tmp[k++] = arr[i];
            i++;
          } else {
            tmp[k++] = arr[j];
            j++;
          }
        }
        while (i < mid) {
          tmp[k++] = arr[i++];
        }
        while (j < len) {
          tmp[k++] = arr[j++];
        }
        // 将排序后的数组复制到原数组的相应位置
        for (j = 0; j < len - index; j++) {
          arr[j + index] = tmp[j];
        }
      }
    },
    // 快速
    quickSort: function *(arr) {
      let stack = [
        [0, arr.length - 1]
      ];
      yield ['blur',this.generateIndexArr(0,arr.length-1)];
      let start, end, left, right, cur, tmp;
      while (stack.length) {
        [start, end] = stack.pop();
        if(start === end){
          yield ['sorted',[start]]
        }
        if (end - start < 1) continue;
        yield ['unblur',this.generateIndexArr(start,end)];
        cur = arr[start];
        yield ['cur',[start]];
        left = start + 1;
        right = end;
        yield ['active',[left,right]];
        while (left <= right) {          
          // 左侧大于 cur, 右侧小于 cur, 交换
          if (arr[left] > cur && arr[right] < cur) {
            this.swap(arr, left, right);
            yield ['swap',[left,right]];
            left++;
            right--;
            yield ['active',[left,right]];
          }
          
          // 左侧小于 cur, 左指针右移
          while (arr[left] <= cur && left <= right) {
            yield ['deactive',[left]];
            left++;
            if(left <= end){
              yield ['active',[left]];
            }
          }
          // 右侧大于 cur, 右指针左移
          while (arr[right] >= cur && right >= left) {
            yield ['deactive',[right]];
            right--;
            if(right >= start){
              yield ['active',[right]];
            }
          }
        }
        if(left <= end){
          yield ['deactive',[left,right]];
        }
        left--;
        yield ['active',[left]];
        arr[start] = arr[left];
        arr[left] = cur;
        yield ['uncur',[start]];
        if(start !== left){
          yield ['swap',[start,left]];
        }
        if(end - start === 1){
          yield ['deactive',[start,end]];
          yield ['sorted',[start,end]];
        }else{
          yield ['deactive',[left]];
          yield ['sorted',[left]];
        }
        yield ['blur',this.generateIndexArr(start,end)];
        stack.push([start, left - 1]);
        stack.push([left + 1, end]);
      }
      return arr;
    },
    // 堆排序
    heapSort(arr) {
      let len = arr.length,
        i;
      // 原地初始化大顶堆，从第一个非叶子结点开始
      // 第一个非叶子节点, len / 2 - 1
      for (i = (len >> 1) - 1; i >= 0; i--) {
        this.heapify(arr, i, len);
      }

      for (let i = len - 1; i > 0; i--) {
        // 根节点与最后一个节点交换
        this.swap(arr, 0, i);
        this.heapify(arr, 0, i);
      }
    },
    // 堆排序 辅助函数
    heapify(arr, i, length) {
      let temp = arr[i]; // 当前父节点
      for (let j = 2 * i + 1; j < length; j = 2 * j + 1) {
        temp = arr[i];
        if (j + 1 < length && arr[j] < arr[j + 1]) {
          j++;
        }
        if (temp < arr[j]) {
          this.swap(arr, i, j);
          i = j;
        } else {
          break;
        }
      }
    },
    // 桶排序
    bucketSort(arr) {    
      let len = arr.length,i,j,max,min;
      if(len < 2) return arr;

      // 初始化桶,10个
      let buckets = [];
      for(i=0;i<10;i++){
        buckets[i] = [];
      }

      max = Math.max.apply(null,arr);
      min = Math.min.apply(null,arr);
      // 每个桶的数字跨度
      let delta = (max - min + 1) / 10;
      let bucket,index;

      for(i=0;i<len;i++){
        // 应放入那个桶
        index = Math.floor((arr[i] - min) / delta);
        bucket = buckets[index];
        index = bucket.length - 1;
        // 入桶时采用插入排序
        while(index >= 0 && bucket[index] > arr[i]){
          bucket[index + 1] = bucket[index];
          index --;
        }
        bucket[index + 1] = arr[i];
      }
      
      // 出桶 ,复制到原数组
      index = 0;
      for(i=0;i<buckets.length;i++){
        for(j=0;j<buckets[i].length;j++){
          arr[index++] = buckets[i][j];
        }
      }
      return arr;
    },
    // 计数
    countingSort(arr) {
      let len = arr.length,
        i, min, max;
      max = min = arr[0];
      for (i = 1; i < len; i++) {
        if (arr[i] < min) {
          min = arr[i];
        }
        if (arr[i] > max) {
          max = arr[i];
        }
      }
      let countLen = max - min + 1;
      let countArr = new Array(countLen).fill(0);
      for (i = 0; i < len; i++) {
        countArr[arr[i] - min]++;
      }
      let index = 0,tmp;
      for(i=0;i<countLen;i++){
        tmp = countArr[i];
        while(tmp-- > 0){
          arr[index++] = min + i;
        }
      }
      return arr;
    },
    // 基数
    radixSort(arr) {
      let buckets = new Array(10);
      let i,j,tmp,index,len = arr.length;
      // 初始化桶
      for(i=0;i<10;i++){
        buckets[i] = [];
      }
      // 得到最大元素的位数
      let radix = String(Math.max.apply(null,arr)).length;
      for(i = 0;i<radix;i++){
        // 入桶
        for(j=0;j<len;j++){
          tmp = arr[j];
          index = String(tmp).padStart(radix,'0')[radix - i - 1];
          // console.log(`tmp:${tmp},index:${index}`);
          buckets[index].push(tmp);
        }
        // 出桶
        index = 0;
        for(j = 0;j < 10;j++){
          while(buckets[j].length){
            arr[index ++] = buckets[j].shift();
          }
        }
      }
      return arr;
    },
    generateIndexArr(start,end){
      return new Array(end - start + 1).fill('').map((item,index)=>index + start);
    },
    wrapArr(arr){
      return arr.map((item, index) => {
        return {
          id: index + 1,
          value: item,
          className: "",
          left: 0
        };
      });
    },
    addClass(indexs, className) {
      for (let i of indexs) {
        let name = this.sortArr[i].className.split(/\s+/);
        if (!name.includes(className)) {
          this.sortArr[i].className = [...name, className].join(" ");
        }
      }
    },
    addClassAsync(indexs, className) {
      this.addClass(indexs, className);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, this.delay);
      });
    },
    removeClass(indexs, className) {
      for (let i of indexs) {
        let name = this.sortArr[i].className.split(/\s+/),
          index = name.indexOf(className);
        if (index !== -1) {
          name.splice(index, 1);
          this.sortArr[i].className = name.join(" ");
        }
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, this.delay);
      });
    },
    removeClassAsync(indexs, className) {
      this.removeClass(indexs, className);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve();
        }, this.delay);
      });
    },
  }
}
